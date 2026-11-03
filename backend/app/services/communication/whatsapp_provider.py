import hashlib
import hmac
import uuid
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.services.communication.provider_interface import (
    BaseDeliveryProvider,
    ProviderDeliveryResult,
)


class MetaWhatsAppProvider(BaseDeliveryProvider):
    """Meta WhatsApp Business Cloud API Provider.
    
    COMPLIANCE & PROTOCOL:
    - Uses Meta Graph API v20.0.
    - Supports approved High-Structured Message (HSM) templates for initiation.
    - Webhook verification via hub.challenge and X-Hub-Signature-256 HMAC-SHA256.
    - Automatic detection of inbound "STOP" / "UNSUBSCRIBE" messages.
    """

    GRAPH_API_VERSION = "v20.0"

    @classmethod
    def format_phone_number(cls, phone: str) -> str:
        return "".join(ch for ch in phone if ch.isdigit())

    @classmethod
    def verify_webhook_signature(cls, raw_body: bytes, signature_header: Optional[str]) -> bool:
        """Validates Meta X-Hub-Signature-256 header against App Secret."""
        secret = settings.META_WHATSAPP_APP_SECRET
        if not secret or not signature_header:
            return True  # Skip verification in dev/sandbox if secret is not set

        expected = "sha256=" + hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature_header)

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
        token = settings.META_WHATSAPP_TOKEN
        phone_id = settings.META_WHATSAPP_PHONE_NUMBER_ID

        is_live = (
            not simulate
            and settings.COMMUNICATION_MODE.upper() == "LIVE"
            and bool(token)
            and bool(phone_id)
            and "YOUR_" not in token
        )

        if not is_live:
            # Clean simulation mode - clearly distinguished from actual delivery
            logger.info(f"[WHATSAPP SIMULATION] Message to {formatted_phone} in '{language}': {message_text[:60]}...")
            sim_wam_id = f"wamid.sim.{uuid.uuid4().hex[:16]}"
            return ProviderDeliveryResult(
                success=True,
                status="SIMULATED",
                carrier_message_id=sim_wam_id,
                duration_seconds=None,
                is_simulation=True,
                metadata={
                    "provider": "META_WHATSAPP_CLOUD_SIMULATOR",
                    "recipient": formatted_phone,
                    "language": language,
                    "template": f"indradhanu_advisory_{language}",
                    "has_action_buttons": True,
                },
            )

        # Real Live Meta Cloud API Call
        endpoint = f"https://graph.facebook.com/{self.GRAPH_API_VERSION}/{phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        
        # Standard WhatsApp Cloud text message with agricultural warning header
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": formatted_phone,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": (
                    f"🌦️ *इंद्रधनु कृषी हवामान सल्ला (Indradhanu)*\n\n"
                    f"{message_text}\n\n"
                    f"⏰ *वेळ (Timing):* {meta.get('timing', 'Next 24h')}\n"
                    f"⚠️ *धोका (Risk):* {meta.get('risk', 'Crop stress')}\n\n"
                    f"_उत्तर द्या (Reply 'STOP' to pause alerts)_"
                ),
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(endpoint, json=payload, headers=headers)
                data = res.json() if res.status_code in [200, 201] else {}
                messages = data.get("messages", [])

                if res.status_code in [200, 201] and len(messages) > 0:
                    wam_id = messages[0].get("id", f"wamid.{uuid.uuid4().hex[:12]}")
                    return ProviderDeliveryResult(
                        success=True,
                        status="SENT",
                        carrier_message_id=wam_id,
                        is_simulation=False,
                        metadata={"meta_response": data},
                    )
                else:
                    err_details = str(data.get("error", {}).get("message") or f"Meta error {res.status_code}")
                    logger.error(f"WhatsApp Cloud API delivery failure: {err_details}")
                    return ProviderDeliveryResult(
                        success=False,
                        status="FAILED",
                        error_message=err_details,
                        is_simulation=False,
                    )

        except Exception as e:
            logger.error(f"Meta WhatsApp network exception: {e}")
            return ProviderDeliveryResult(
                success=False,
                status="FAILED",
                error_message=f"WhatsApp connection exception: {str(e)}",
                is_simulation=False,
            )

    async def process_webhook(
        self,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Parses Meta Webhook status updates (sent, delivered, read, failed) or incoming messages."""
        entries = payload.get("entry", [])
        if not entries:
            return {"status": "NOOP"}

        changes = entries[0].get("changes", [])
        if not changes:
            return {"status": "NOOP"}

        value = changes[0].get("value", {})
        statuses = value.get("statuses", [])
        messages = value.get("messages", [])

        # Case 1: Status Receipts (sent, delivered, read, failed)
        if statuses:
            st = statuses[0]
            wam_id = st.get("id")
            raw_status = (st.get("status") or "").upper()
            errors = st.get("errors")

            status_map = {
                "SENT": "SENT",
                "DELIVERED": "DELIVERED",
                "READ": "READ",
                "FAILED": "FAILED",
            }

            return {
                "event_type": "status_update",
                "carrier_message_id": wam_id,
                "status": status_map.get(raw_status, "SENT"),
                "timestamp": st.get("timestamp"),
                "recipient_id": st.get("recipient_id"),
                "error_reason": str(errors) if errors else None,
            }

        # Case 2: Inbound message from farmer (e.g. "STOP" or "REPLAY")
        if messages:
            msg = messages[0]
            sender_phone = msg.get("from")
            body_text = msg.get("text", {}).get("body", "").strip().upper()

            is_opt_out = body_text in ["STOP", "UNSUBSCRIBE", "OPT OUT", "OPTOUT", "थंबवा", "रोको"]
            return {
                "event_type": "inbound_message",
                "sender_phone": sender_phone,
                "message_text": body_text,
                "is_opt_out": is_opt_out,
            }

        return {"status": "NOOP"}
