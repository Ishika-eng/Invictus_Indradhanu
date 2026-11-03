from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check payload schema."""
    status: str = Field(default="healthy", description="Overall health status")
    version: str = Field(default="1.0.0", description="API version")
    environment: str = Field(default="development", description="Runtime environment")
    database: str = Field(default="connected", description="Database connection health")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), description="Server timestamp"
    )


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


class StatusMessage(BaseModel):
    success: bool
    message: str
