import logging
from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class EntityNotFoundException(AppException):
    """Raised when a requested resource is not found."""

    def __init__(self, message_or_entity: str, entity_id: Any = None):
        if entity_id is not None:
            msg = f"{message_or_entity} with identifier '{entity_id}' was not found."
            details = {"entity": message_or_entity, "identifier": str(entity_id)}
        else:
            msg = message_or_entity
            details = {}
        super().__init__(
            message=msg,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class DuplicateEntityException(AppException):
    """Raised when a unique constraint or duplication is violated."""

    def __init__(
        self,
        message_or_entity: str,
        field_name: Optional[str] = None,
        value: Any = None,
    ):
        if field_name is not None:
            msg = f"{message_or_entity} with {field_name} '{value}' already exists."
            details = {"entity": message_or_entity, "field": field_name, "value": str(value)}
        else:
            msg = message_or_entity
            details = {}
        super().__init__(
            message=msg,
            status_code=status.HTTP_409_CONFLICT,
            details=details,
        )


class DatabaseConnectivityException(AppException):
    """Raised when database health check or connectivity fails."""

    def __init__(self, reason: str):
        super().__init__(
            message="Database connection error",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"reason": reason},
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handles all custom application exceptions."""
    logger.warning(f"AppException on {request.method} {request.url}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.message,
                "details": exc.details,
            },
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Fallback handler for unhandled server exceptions."""
    logger.exception(f"Unhandled server error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "message": "Internal server error occurred. Please try again later.",
                "details": str(exc),
            },
        },
    )
