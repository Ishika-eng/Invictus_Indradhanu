import uuid
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.services.communication.provider_interface import (
    BaseDeliveryProvider,
    ProviderDeliveryResult,
)


class ExotelVoiceProvider(BaseDeliveryProvider):
    """Voice IVR Provider integrating Exotel with Regional Speech & Keypad Flow.
    
    KEYPAD (DTMF) FLOW SPECIFICATION:
    - Key 1: Replay advisory audio.
    - Key 2: Switch spoken language (Marathi, Hindi, Telugu, English).
    - Key 3: Connect directly with Krishi Vigyan Kendra (KVK) agricultural officer.
    """

    @classmethod
    def format_phone_number(cls, phone: str) -> str:
        cleaned = "".join(ch for ch in phone if ch.isdigit())
        if len(cleaned) == 10:
            return f"0{cleaned}"  # Exotel standard domestic format
        elif len(cleaned) == 12 and cleaned.startswith("91"):
            return f"0{cleaned[2:]}"
        return cleaned

    @classmethod
    def build_voice_script(cls, message_text: str, language: str, crop_name: str = "Crop") -> str:
        """Constructs an empathetic, conversational regional voice script for TTS."""
        lang = language.lower()
        if lang == "mr":
            return (
                f"नमस्कार शेतकरी बंधूंनो, इंद्रधनु कृषी हवामान सल्ल्यामध्ये आपले स्वागत आहे. "
                f"{message_text} "
                f"हा सल्ला पुन्हा ऐकण्यासाठी १ दाबा. भाषा बदलण्यासाठी २ दाबा. "
                f"कृषी तज्ज्ञांशी बोलण्यासाठी ३ दाबा. धन्यवाद."
            )
        elif lang == "hi":
            return (
                f"नमस्ते किसान भाई, इंद्रधनु कृषि मौसम सेवा में आपका स्वागत है। "
                f"{message_text} "
                f"यह सलाह दोबारा सुनने के लिए १ दबाएं। भाषा बदलने के लिए २ दबाएं। "
                f"कृषि विशेषज्ञ से बात करने के लिए ३ दबाएं। धन्यवाद।"
            )
        elif lang == "te":
            return (
                f"నమస్కారం రైతు సోదరులారా, ఇంద్రధనుస్సు వ్యవసాయ వాతావరణ సలహాకు స్వాగతం. "
                f"{message_text} "
                f"ఈ సలహాను మళ్లీ వినడానికి 1 నొక్కండి. నిపుణులతో మాట్లాడటానికి 3 నొక్కండి."
            )
        elif lang == "sw":
            return (
                f"Habari mkulima, karibu kwenye huduma ya hali ya hewa ya Indradhanu. "
                f"{message_text} "
                f"Kusikiliza tena bonyeza 1. Kuwasiliana na mtaalamu wa kilimo bonyeza 3."
            )
        else:
            return (
                f"Hello farmer, welcome to Indradhanu climate advisory service. "
                f"{message_text} "
                f"To repeat this advisory, press 1. To change language, press 2. "
                f"To speak with an agricultural expert, press 3. Thank you."
            )

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
        script = self.build_voice_script(message_text, language, meta.get("crop_name", "Crop"))

        is_live = (
            not simulate
            and settings.COMMUNICATION_MODE.upper() == "LIVE"
            and bool(settings.EXOTEL_API_KEY)
            and bool(settings.EXOTEL_API_TOKEN)
            and "YOUR_" not in settings.EXOTEL_API_KEY
        )

        if not is_live:
            # Clean simulation mode - clearly distinguished from actual delivery
            logger.info(f"[VOICE IVR SIMULATION] Outbound call to {formatted_phone} in '{language}': {script[:70]}...")
            sim_call_id = f"sim_call_{uuid.uuid4().hex[:12]}"
            return ProviderDeliveryResult(
                success=True,
                status="SIMULATED",
                carrier_message_id=sim_call_id,
                duration_seconds=48,  # Typical automated advisory duration
                is_simulation=True,
                metadata={
                    "provider": "EXOTEL_IVR_SIMULATOR",
                    "recipient": formatted_phone,
                    "language": language,
                    "simulated_call_duration_seconds": 48,
                    "simulated_dtmf_menu": "1:Replay, 2:Language, 3:KVK_Expert",
                    "voice_script": script,
                },
            )

        # Real Live Exotel Outbound Connect Call
        endpoint = f"https://{settings.EXOTEL_SUBDOMAIN}/v1/Accounts/{settings.EXOTEL_API_KEY}/Calls/connect.json"
        payload = {
            "From": formatted_phone,
            "To": settings.EXOTEL_CALLER_ID,
            "CallerId": settings.EXOTEL_CALLER_ID,
            "Url": f"http://my.exotel.com/{settings.EXOTEL_API_KEY}/exomls/{settings.EXOTEL_APP_ID}",
            "CustomField": str(meta.get("advisory_id", "")),
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    endpoint,
                    data=payload,
                    auth=(settings.EXOTEL_API_KEY, settings.EXOTEL_API_TOKEN),
                )
                data = res.json() if res.status_code == 200 else {}
                call_info = data.get("Call", {})

                if res.status_code == 200 and call_info.get("Sid"):
                    return ProviderDeliveryResult(
                        success=True,
                        status="SENT",
                        carrier_message_id=call_info["Sid"],
                        duration_seconds=None,
                        is_simulation=False,
                        metadata={"exotel_call_sid": call_info["Sid"], "status": call_info.get("Status")},
                    )
                else:
                    err_msg = str(data.get("RestException", {}).get("Message") or f"Exotel error code {res.status_code}")
                    logger.error(f"Exotel call failed: {err_msg}")
                    return ProviderDeliveryResult(
                        success=False,
                        status="FAILED",
                        error_message=err_msg,
                        is_simulation=False,
                    )

        except Exception as e:
            logger.error(f"Exotel call exception: {e}")
            return ProviderDeliveryResult(
                success=False,
                status="FAILED",
                error_message=f"Voice carrier exception: {str(e)}",
                is_simulation=False,
            )

    async def process_webhook(
        self,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Parses Exotel Call Status or Passthru Applet Callback."""
        call_sid = payload.get("CallSid") or payload.get("Sid")
        raw_status = (payload.get("Status") or payload.get("DialCallStatus") or "").lower()
        duration_sec = int(payload.get("CallDuration") or payload.get("Legs", {}).get("Duration") or 0)
        digits_pressed = payload.get("Digits")

        status_mapping = {
            "completed": "ANSWERED",
            "busy": "FAILED",
            "no-answer": "FAILED",
            "failed": "FAILED",
            "canceled": "FAILED",
            "in-progress": "SENDING",
            "ringing": "SENT",
        }
        normalized_status = status_mapping.get(raw_status, "ANSWERED" if duration_sec > 10 else "FAILED")

        return {
            "carrier_message_id": call_sid,
            "status": normalized_status,
            "raw_status": raw_status,
            "duration_seconds": duration_sec,
            "digits_pressed": digits_pressed,
            "recording_url": payload.get("RecordingUrl"),
        }
