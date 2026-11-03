import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_farmer
from app.models.farmer import Farmer
from app.models.delivery import DeliveryLog
from app.core.config import settings
from app.core.logging import logger
from app.schemas.delivery import (
    DeliveryLogResponse,
    DeliveryDispatchRequest,
    DeliveryDispatchResponse,
    OptOutRequest,
    ChannelPreferenceUpdate,
)
from app.services.communication.delivery_dispatcher import DeliveryDispatcher

router = APIRouter()
dispatcher = DeliveryDispatcher()


@router.post(
    "/dispatch",
    response_model=DeliveryDispatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Dispatch advisory across SMS, Voice IVR, and WhatsApp",
    description=(
        "Initiates verified multichannel delivery to the registered farmer. "
        "Enforces consent checks, daily rate limits, and idempotency guards. "
        "Explicitly marks and distinguishes simulation mode from live carrier deliveries."
    ),
)
async def dispatch_advisory(
    body: DeliveryDispatchRequest,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await dispatcher.dispatch_advisory(
        db=db,
        advisory_id=body.advisory_id,
        channels=body.channels,
        simulate=body.simulate,
        custom_phone=body.custom_phone,
    )


@router.get(
    "/history",
    response_model=List[DeliveryLogResponse],
    summary="Get delivery transmission history",
    description="Lists outbound transmission logs filtered by farmer, advisory, channel, or status.",
)
async def get_delivery_history(
    advisory_id: Optional[uuid.UUID] = Query(None, description="Filter by advisory ID"),
    channel: Optional[str] = Query(None, description="Filter by channel ('SMS', 'VOICE_IVR', 'WHATSAPP')"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    query = select(DeliveryLog).where(DeliveryLog.farmer_id == current_farmer.id)
    if advisory_id:
        query = query.where(DeliveryLog.advisory_id == advisory_id)
    if channel:
        query = query.where(DeliveryLog.channel == channel.upper())

    result = await db.execute(query.order_by(DeliveryLog.created_at.desc()).offset(skip).limit(limit))
    return list(result.scalars().all())


@router.post(
    "/opt-out",
    summary="Record farmer opt-out / DND request",
    description="Allows farmers to opt out of automated advisory transmissions via SMS, Voice, or WhatsApp.",
)
async def opt_out(
    body: OptOutRequest,
    db: AsyncSession = Depends(get_db),
):
    return await dispatcher.handle_opt_out(db, body.phone_number, body.reason or "MANUAL_OPTOUT")


@router.put(
    "/preferences",
    summary="Update notification channel preference and opt-in",
    description="Allows registered farmers to configure their preferred delivery channel.",
)
async def update_preferences(
    body: ChannelPreferenceUpdate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await dispatcher.update_preferences(
        db=db,
        farmer_id=current_farmer.id,
        preferred_channel=body.preferred_channel,
        is_opted_in=body.is_opted_in,
    )


# ==============================================================================
# CARRIER WEBHOOK CALLBACKS
# ==============================================================================

@router.get(
    "/webhooks/whatsapp",
    summary="Meta WhatsApp Webhook Verification",
    description="Handles Meta hub.challenge verification request during webhook configuration.",
)
async def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    if hub_mode == "subscribe" and hub_verify_token == settings.META_WHATSAPP_VERIFY_TOKEN:
        logger.info("Meta WhatsApp webhook subscription verified successfully.")
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch")


@router.post(
    "/webhooks/{channel}",
    summary="Carrier Delivery Receipt Webhook Callback",
    description="Receives delivery receipts and status updates from MSG91 (SMS), Exotel (Voice), and Meta (WhatsApp).",
)
async def handle_carrier_webhook(
    channel: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_hub_signature_256: Optional[str] = Header(None, alias="X-Hub-Signature-256"),
):
    raw_body = await request.body()
    try:
        payload = await request.json()
    except Exception:
        # Some voice/sms carriers send form data
        form = await request.form()
        payload = dict(form)

    # Security: Verify Meta WhatsApp signature if present
    if channel.lower() == "whatsapp" and settings.META_WHATSAPP_APP_SECRET:
        if not dispatcher.whatsapp_provider.verify_webhook_signature(raw_body, x_hub_signature_256):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid HMAC signature")

    headers_dict = dict(request.headers)
    return await dispatcher.process_carrier_webhook(
        db=db,
        channel=channel,
        payload=payload,
        headers=headers_dict,
    )

