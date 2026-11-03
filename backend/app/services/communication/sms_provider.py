import uuid
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.services.communication.provider_interface import (
    BaseDeliveryProvider,
    ProviderDeliveryResult,
)


class MSG91SmsProvider(BaseDeliveryProvider):
    """Indian SMS Provider integrating MSG91 with TRAI DLT compliance.
    
    DLT COMPLIANCE NOTES:
    - TRAI mandates Principal Entity (PE) and Content Template (TE) registration on Indian DLT portals.
    - Header/Sender ID: 6 uppercase alphabets (default: INDRDH).
    - Unicode character encoding: 70 characters per segment for Marathi/Hindi/Telugu; 160 characters for English.
    """

    API_URL = "https://control.msg91.com/api/v5/flow/"

    @classmethod
    def format_phone_number(cls, phone: str) -> str:
        """Formats phone number into clean 10-digit Indian standard or E.164."""
        cleaned = "".join(ch for ch in phone if ch.isdigit())
        if len(cleaned) == 10:
            return f"91{cleaned}"
        elif len(cleaned) == 12 and cleaned.startswith("91"):
            return cleaned
        elif len(cleaned) == 11 and cleaned.startswith("0"):
            return f"91{cleaned[1:]}"
        return cleaned

    async def send(
        self,
        recipient_phone: str,
        message_text: str,
        language: str,
        metadata: Optional[Dict[str, Any]] = None,
        simulate: bool = False,
    ) -> ProviderDeliveryResult:
        formatted_phone = self.format_phone_number(recipient_phone)
        meta = metadata or {}
        auth_key = settings.MSG91_AUTH_KEY

        # Check if live mode is requested and credentials are valid
        is_live = (
            not simulate
            and settings.COMMUNICATION_MODE.upper() == "LIVE"
            and bool(auth_key)
            and len(auth_key) >= 15
            and "YOUR_" not in auth_key
        )

        if not is_live:
            # Clean simulation mode - clearly distinguished from actual delivery
            logger.info(f"[SMS SIMULATION] Dispatch to {formatted_phone} in '{language}': {message_text[:60]}...")
            sim_id = f"sim_sms_{uuid.uuid4().hex[:12]}"
            return ProviderDeliveryResult(
                success=True,
                status="SIMULATED",
                carrier_message_id=sim_id,
                duration_seconds=None,
                is_simulation=True,
                metadata={
                    "provider": "MSG91_SIMULATOR",
                    "sender_id": settings.MSG91_SENDER_ID,
                    "recipient": formatted_phone,
                    "language": language,
                    "dlt_template_id": settings.MSG91_DLT_TE_ID or "DLT_SANDBOX_TE",
                    "character_count": len(message_text),
                },
            )

        # Real Live MSG91 Flow API Call
        payload = {
            "template_id": settings.MSG91_DLT_TE_ID,
            "sender": settings.MSG91_SENDER_ID,
            "short_url": "0",
            "recipients": [
                {
                    "mobiles": formatted_phone,
                    "VAR1": message_text[:120],
                    "VAR2": meta.get("timing", "Next 24h"),
                }
            ],
        }
        headers = {
            "authkey": auth_key,
            "content-type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(self.API_URL, json=payload, headers=headers)
                data = res.json() if res.status_code == 200 else {}
                
                if res.status_code == 200 and data.get("type") == "success":
                    carrier_id = data.get("message", f"msg91_{uuid.uuid4().hex[:8]}")
                    return ProviderDeliveryResult(
                        success=True,
                        status="SENT",
                        carrier_message_id=carrier_id,
                        is_simulation=False,
                        metadata={"msg91_response": data, "recipient": formatted_phone},
                    )
                else:
                    err_msg = data.get("message") or f"MSG91 error status {res.status_code}"
                    logger.error(f"MSG91 send failure: {err_msg}")
                    return ProviderDeliveryResult(
                        success=False,
                        status="FAILED",
                        error_message=err_msg,
                        is_simulation=False,
                        metadata={"status_code": res.status_code, "response": data},
                    )

        except Exception as e:
            logger.error(f"MSG91 HTTP connection error: {e}")
            return ProviderDeliveryResult(
                success=False,
                status="FAILED",
                error_message=f"Network exception: {str(e)}",
                is_simulation=False,
            )

    async def process_webhook(
        self,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Processes MSG91 Delivery Receipt (DLR) webhook callback."""
        carrier_id = payload.get("requestId") or payload.get("message_id")
        raw_status = (payload.get("status") or "").upper()

        status_mapping = {
            "DELIVERED": "DELIVERED",
            "SUCCESS": "DELIVERED",
            "FAILED": "FAILED",
            "REJECTED": "FAILED",
            "EXPIRED": "FAILED",
            "PENDING": "SENT",
        }
        normalized_status = status_mapping.get(raw_status, "SENT")

        return {
            "carrier_message_id": carrier_id,
            "status": normalized_status,
            "raw_status": raw_status,
            "error_reason": payload.get("description"),
            "delivery_time": payload.get("delivery_time"),
        }
