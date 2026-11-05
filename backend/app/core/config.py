from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings parsed from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "Indradhanu Climate Advisory API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS settings
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        default_origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://localhost:8081",
            "http://127.0.0.1:8081",
            "http://localhost:19006",
            "http://127.0.0.1:19006",
        ]
        if isinstance(v, str):
            v_str = v.strip()
            # If JSON array string like '["http://localhost:3000"]'
            if v_str.startswith("[") and v_str.endswith("]"):
                import json
                try:
                    parsed = json.loads(v_str)
                    if isinstance(parsed, list):
                        v = parsed
                except Exception:
                    pass
            if isinstance(v, str):
                items = [i.strip().strip("'\"").rstrip("/") for i in v_str.split(",") if i.strip()]
                for o in default_origins:
                    if o not in items:
                        items.append(o)
                return items

        if isinstance(v, list):
            items = [str(i).strip().strip("'\"").rstrip("/") for i in v if str(i).strip()]
            for o in default_origins:
                if o not in items:
                    items.append(o)
            return items

        return default_origins

    # Database Settings
    # Default to SQLite for seamless local development & tests if PostgreSQL is not specified
    DATABASE_URL: str = "sqlite+aiosqlite:///./indradhanu.db"
    SYNC_DATABASE_URL: str = "sqlite:///./indradhanu.db"

    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO_SQL: bool = False

    # Supabase Auth & JWT Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str = "dev-secret-change-in-production-supabase-jwt"
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # External APIs (Pre-configured for future phases)
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Stage 6: Multichannel Advisory Communication Settings
    COMMUNICATION_MODE: str = "SIMULATION"  # "SIMULATION" or "LIVE"
    
    # SMS: MSG91 & Indian DLT (Distributed Ledger Technology) Configuration
    MSG91_AUTH_KEY: str = ""
    MSG91_SENDER_ID: str = "INDRDH"
    MSG91_DLT_TE_ID: str = ""
    
    # Voice IVR: Exotel & TTS Configuration
    EXOTEL_API_KEY: str = ""
    EXOTEL_API_TOKEN: str = ""
    EXOTEL_SUBDOMAIN: str = "api.exotel.com"
    EXOTEL_CALLER_ID: str = ""
    EXOTEL_APP_ID: str = ""
    
    # WhatsApp: Meta Cloud API Configuration
    META_WHATSAPP_TOKEN: str = ""
    META_WHATSAPP_PHONE_NUMBER_ID: str = ""
    META_WHATSAPP_VERIFY_TOKEN: str = "indradhanu_secure_webhook_verify_token"
    META_WHATSAPP_APP_SECRET: str = ""

    # Legacy Twilio fields (fallback/development)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Stage 7 Admin & Operator Governance Key
    ADMIN_SECRET_KEY: str = "indradhanu_admin_super_secret_key_2026"


settings = Settings()
