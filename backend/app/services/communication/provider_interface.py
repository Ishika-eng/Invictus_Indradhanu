from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ProviderDeliveryResult(BaseModel):
    """Normalized delivery outcome returned by any communication channel provider."""
    success: bool
    status: str = Field(..., description="'SENT', 'DELIVERED', 'FAILED', 'SIMULATED'")
    carrier_message_id: Optional[str] = None
    error_message: Optional[str] = None
    duration_seconds: Optional[int] = None
    metadata: Dict[str, Any] = {}
    is_simulation: bool = False


class BaseDeliveryProvider(ABC):
    """Abstract provider interface for pluggable communication channels."""

    @abstractmethod
    async def send(
        self,
        recipient_phone: str,
        message_text: str,
        language: str,
        metadata: Optional[Dict[str, Any]] = None,
        simulate: bool = False,
    ) -> ProviderDeliveryResult:
        """Sends an outbound advisory message or initiates a voice IVR call."""
        pass

    @abstractmethod
    async def process_webhook(
        self,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Parses carrier delivery receipts or incoming user events."""
        pass

