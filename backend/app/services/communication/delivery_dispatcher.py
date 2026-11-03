from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import EntityNotFoundException, ValidationException
from app.core.logging import logger
from app.models.advisory import Advisory
from app.models.farmer import Farmer
from app.models.delivery import DeliveryLog
from app.schemas.delivery import (
    DeliveryLogResponse,
    DeliveryDispatchResponse,
)
from app.services.communication.sms_provider import MSG91SmsProvider
from app.services.communication.voice_provider import ExotelVoiceProvider
from app.services.communication.whatsapp_provider import MetaWhatsAppProvider


class DeliveryDispatcher:
    """Master Multichannel Advisory Delivery Dispatcher.
    
    GOVERNANCE & SAFETY CONTROLS:
    - Verifies farmer consent & blocks opted-out recipients.
    - Prevents notification spam with a strict rate limit (max 5 alerts/24h per farmer).
    - Enforces idempotency to eliminate duplicate carrier transmissions.
    - Transparently tags sandboxed simulation mode (never falsely claims simulated alerts are carrier-delivered).
    """

    MAX_DAILY_DELIVERIES_PER_FARMER = 5

    def __init__(self):
        self.sms_provider = MSG91SmsProvider()
        self.voice_provider = ExotelVoiceProvider()
        self.whatsapp_provider = MetaWhatsAppProvider()

    async def dispatch_advisory(
        self,
        db: AsyncSession,
        advisory_id: uuid.UUID,
        channels: List[str],
        simulate: bool = False,
        custom_phone: Optional[str] = None,
    ) -> DeliveryDispatchResponse:
        """Dispatches an advisory across selected channels with safety, idempotency, and audit logging."""
        # 1. Retrieve Advisory with Farmer and Crop context
        result = await db.execute(
            select(Advisory)
            .options(selectinload(Advisory.farmer), selectinload(Advisory.crop))
            .where(Advisory.id == advisory_id)
        )
        advisory = result.scalar_one_or_none()
        if not advisory:
            raise EntityNotFoundException(f"Advisory with id '{advisory_id}' not found")

        farmer = advisory.farmer
        if not farmer:
            raise EntityNotFoundException(f"Farmer record associated with advisory '{advisory_id}' not found")

        target_phone = custom_phone or farmer.phone_number
        language = advisory.language or farmer.preferred_language or "en"
        crop_name = advisory.crop.name if advisory.crop else "Crop"

        # 2. Consent & Opt-Out Verification
        if not farmer.is_opted_in:
            logger.warning(f"Dispatch aborted: Farmer {farmer.id} ({target_phone}) has opted out of alerts.")
            # Record failed log for audit trail
            log = DeliveryLog(
                advisory_id=advisory.id,
                farmer_id=farmer.id,
                channel=channels[0] if channels else "SMS",
                status="FAILED",
                recipient_phone=target_phone,
                content_snippet=advisory.immediate_action[:150],
                language=language,
                error_message="Farmer has opted out of automated advisory transmissions (DND/Opt-Out active).",
                provider="DISPATCHER_GUARD",
                is_simulation=simulate,
            )
            db.add(log)
            await db.commit()
            await db.refresh(log)
            return DeliveryDispatchResponse(
                dispatch_id=str(uuid.uuid4()),
                advisory_id=str(advisory.id),
                farmer_id=str(farmer.id),
                channel_outcomes=[DeliveryLogResponse.model_validate(log)],
                mode="SIMULATION" if simulate else "LIVE",
                summary="Dispatch rejected: Recipient has previously opted out of notifications.",
            )

        # 3. Rate Limiting Check (Max 5 deliveries per farmer per 24 hours)
        one_day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        count_res = await db.execute(
            select(func.count(DeliveryLog.id)).where(
                DeliveryLog.farmer_id == farmer.id,
                DeliveryLog.created_at >= one_day_ago,
                DeliveryLog.status.in_(["SENT", "DELIVERED", "ANSWERED"]),
            )
        )
        recent_count = count_res.scalar_one() or 0
        if recent_count >= self.MAX_DAILY_DELIVERIES_PER_FARMER and not simulate:
            logger.warning(f"Rate limit exceeded for farmer {farmer.id}: {recent_count} deliveries in last 24h.")
            log = DeliveryLog(
                advisory_id=advisory.id,
                farmer_id=farmer.id,
                channel=channels[0] if channels else "SMS",
                status="FAILED",
                recipient_phone=target_phone,
                content_snippet=advisory.immediate_action[:150],
                language=language,
                error_message=f"Rate limit exceeded: maximum {self.MAX_DAILY_DELIVERIES_PER_FARMER} notifications per 24 hours.",
                provider="RATE_LIMITER",
                is_simulation=False,
            )
            db.add(log)
            await db.commit()
            await db.refresh(log)
            return DeliveryDispatchResponse(
                dispatch_id=str(uuid.uuid4()),
                advisory_id=str(advisory.id),
                farmer_id=str(farmer.id),
                channel_outcomes=[DeliveryLogResponse.model_validate(log)],
                mode="LIVE",
                summary="Dispatch halted by rate limiter: 24-hour advisory quota reached.",
            )

        # Normalize channel list
        norm_channels = []
        for ch in channels:
            ch_up = ch.upper().strip()
            if ch_up in ["ALL", "EVERY"]:
                norm_channels = ["SMS", "VOICE_IVR", "WHATSAPP"]
                break
            elif ch_up in ["SMS", "VOICE_IVR", "WHATSAPP"]:
                norm_channels.append(ch_up)
        if not norm_channels:
            norm_channels = [farmer.preferred_channel.upper() if farmer.preferred_channel else "SMS"]

        outcomes: List[DeliveryLog] = []

        # 4. Dispatch Loop per Channel
        for channel in norm_channels:
            idempotency_key = f"idemp_{advisory.id}_{channel}_{target_phone}"

            # Check Idempotency (prevent duplicate send within 2 hours)
            two_hours_ago = datetime.now(timezone.utc) - timedelta(hours=2)
            existing_res = await db.execute(
                select(DeliveryLog).where(
                    DeliveryLog.idempotency_key == idempotency_key,
                    DeliveryLog.created_at >= two_hours_ago,
                )
            )
            existing_log = existing_res.scalars().first()
            if existing_log and not simulate:
                logger.info(f"Duplicate dispatch prevented by idempotency key: {idempotency_key}")
                outcomes.append(existing_log)
                continue

            metadata = {
                "advisory_id": str(advisory.id),
                "crop_name": crop_name,
                "timing": advisory.recommended_timing,
                "risk": advisory.risk_if_ignored,
            }

            if channel == "SMS":
                res = await self.sms_provider.send(
                    recipient_phone=target_phone,
                    message_text=f"{advisory.immediate_action} {advisory.why_it_matters}",
                    language=language,
                    metadata=metadata,
                    simulate=simulate,
                )
                provider_name = "MSG91"
            elif channel == "VOICE_IVR":
                res = await self.voice_provider.send(
                    recipient_phone=target_phone,
                    message_text=f"{advisory.immediate_action} {advisory.why_it_matters}",
                    language=language,
                    metadata=metadata,
                    simulate=simulate,
                )
                provider_name = "EXOTEL"
            elif channel == "WHATSAPP":
                res = await self.whatsapp_provider.send(
                    recipient_phone=target_phone,
                    message_text=f"{advisory.immediate_action}\n\n{advisory.why_it_matters}",
                    language=language,
                    metadata=metadata,
                    simulate=simulate,
                )
                provider_name = "META_WHATSAPP"
            else:
                continue

            delivery_record = DeliveryLog(
                advisory_id=advisory.id,
                farmer_id=farmer.id,
                channel=channel,
                status=res.status,
                recipient_phone=target_phone,
                content_snippet=advisory.immediate_action[:180],
                language=language,
                duration_seconds=res.duration_seconds,
                carrier_message_id=res.carrier_message_id,
                error_message=res.error_message,
                provider=provider_name if not res.is_simulation else f"{provider_name}_SIMULATOR",
                idempotency_key=idempotency_key,
                is_simulation=res.is_simulation,
                delivery_metadata=res.metadata,
            )
            db.add(delivery_record)
            outcomes.append(delivery_record)

        await db.commit()
        for o in outcomes:
            await db.refresh(o)

        mode_str = "SIMULATION" if simulate or any(o.is_simulation for o in outcomes) else "LIVE"
        summary_str = f"Successfully processed {len(outcomes)} channel transmission(s) in {mode_str} mode."

        return DeliveryDispatchResponse(
            dispatch_id=str(uuid.uuid4()),
            advisory_id=str(advisory.id),
            farmer_id=str(farmer.id),
            channel_outcomes=[DeliveryLogResponse.model_validate(o) for o in outcomes],
            mode=mode_str,
            summary=summary_str,
        )

    async def handle_opt_out(self, db: AsyncSession, phone_number: str, reason: str = "STOP") -> Dict[str, Any]:
        """Processes opt-out / DND request from farmer."""
        clean_phone = "".join(ch for ch in phone_number if ch.isdigit())
        result = await db.execute(
            select(Farmer).where(Farmer.phone_number.contains(clean_phone[-10:]))
        )
        farmer = result.scalars().first()
        if not farmer:
            return {"status": "not_found", "message": f"No farmer registered with phone matching {phone_number}"}

        farmer.is_opted_in = False
        farmer.opt_out_reason = reason
        await db.commit()
        logger.info(f"Farmer {farmer.id} ({farmer.phone_number}) successfully opted out. Reason: {reason}")
        return {
            "status": "success",
            "farmer_id": str(farmer.id),
            "phone_number": farmer.phone_number,
            "is_opted_in": False,
            "message": "Opt-out recorded. All automated alerts paused.",
        }

    async def update_preferences(
        self,
        db: AsyncSession,
        farmer_id: uuid.UUID,
        preferred_channel: str,
        is_opted_in: bool,
    ) -> Dict[str, Any]:
        """Updates notification channel preference and opt-in status."""
        result = await db.execute(select(Farmer).where(Farmer.id == farmer_id))
        farmer = result.scalar_one_or_none()
        if not farmer:
            raise EntityNotFoundException("Farmer not found")

        farmer.preferred_channel = preferred_channel.upper()
        farmer.is_opted_in = is_opted_in
        if is_opted_in:
            farmer.opt_out_reason = None
        await db.commit()
        await db.refresh(farmer)

        return {
            "farmer_id": str(farmer.id),
            "preferred_channel": farmer.preferred_channel,
            "is_opted_in": farmer.is_opted_in,
        }

    async def process_carrier_webhook(
        self,
        db: AsyncSession,
        channel: str,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Handles provider delivery receipt callbacks and status updates."""
        ch = channel.upper()
        if ch == "SMS":
            parsed = await self.sms_provider.process_webhook(payload, headers)
        elif ch == "VOICE_IVR":
            parsed = await self.voice_provider.process_webhook(payload, headers)
        elif ch == "WHATSAPP":
            parsed = await self.whatsapp_provider.process_webhook(payload, headers)
            # Handle inbound opt-out if farmer texted "STOP"
            if parsed.get("is_opt_out") and parsed.get("sender_phone"):
                await self.handle_opt_out(db, parsed["sender_phone"], reason="WHATSAPP_STOP")
        else:
            return {"status": "unsupported_channel"}

        carrier_id = parsed.get("carrier_message_id")
        if carrier_id:
            res = await db.execute(
                select(DeliveryLog).where(DeliveryLog.carrier_message_id == carrier_id)
            )
            log = res.scalars().first()
            if log:
                if parsed.get("status"):
                    log.status = parsed["status"]
                if parsed.get("duration_seconds") is not None:
                    log.duration_seconds = parsed["duration_seconds"]
                if parsed.get("error_reason"):
                    log.error_message = parsed["error_reason"]
                await db.commit()
                return {"status": "updated", "delivery_log_id": str(log.id), "new_status": log.status}

        return {"status": "acknowledged", "parsed": parsed}

