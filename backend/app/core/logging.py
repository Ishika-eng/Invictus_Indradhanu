import logging
import sys
from app.core.config import settings


def setup_logging() -> None:
    """Configures structured application logging."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    logging_format = (
        "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s"
    )

    logging.basicConfig(
        level=log_level,
        format=logging_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    # Suppress overly verbose third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DB_ECHO_SQL else logging.WARNING
    )


logger = logging.getLogger("indradhanu")

