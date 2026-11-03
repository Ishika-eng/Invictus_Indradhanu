# Indradhanu - Climate Advisory Backend API

The production-grade, asynchronous backend engine powering **Indradhanu: Hyperlocal AI Climate & Agricultural Advisory Platform**.

Transforms environmental and meteorological data from **Open-Meteo** and **NASA POWER** into hyper-localized, actionable farming recommendations delivered over **Voice IVR**, **SMS**, and **WhatsApp**.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Python 3.10+ / [FastAPI](https://fastapi.tiangolo.com/) (Async ASGI)
- **Database**: PostgreSQL (Supabase) + [PostGIS](https://postgis.net/) for spatial geospatial coordinates & geometries
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Full Async API with `asyncpg` and `psycopg3`)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/latest/) & `pydantic-settings`
- **Testing**: `pytest`, `pytest-asyncio`, `httpx`

### Directory Layout

```
backend/
├── alembic/                  # Database migration environments & revisions
│   ├── versions/             # Auto-generated database migration scripts
│   └── env.py                # Alembic runtime configuration
├── app/
│   ├── api/                  # API routers & dependency injection
│   │   ├── deps.py           # Database session dependencies
│   │   └── v1/
│   │       ├── endpoints/    # Route controllers (health, farmers, farms, crops, advisories)
│   │       └── router.py     # Aggregated v1 router
│   ├── core/                 # App configuration, logging & exceptions
│   │   ├── config.py         # Pydantic Settings & environment variables
│   │   ├── exceptions.py     # Global exception handlers
│   │   └── logging.py        # Structured log configuration
│   ├── database/             # Database connection & spatial extensions
│   │   ├── base.py           # DeclarativeBase & TimestampMixin
│   │   ├── session.py        # Async engine & sessionmaker
│   │   └── spatial.py        # PostGIS EPSG:4326 Point & Polygon geometries
│   ├── models/               # SQLAlchemy 2.0 database models
│   │   ├── farmer.py         # Smallholder farmer profile & trust score
│   │   ├── farm.py           # Farm plots (lat/lon, PostGIS, soil type, irrigation)
│   │   ├── crop.py           # Crops & phenological growth stages
│   │   ├── climate.py        # Climate observation records & root-zone metrics
│   │   ├── risk.py           # Climate risk assessment results
│   │   ├── advisory.py       # Actionable farmer recommendations
│   │   └── delivery.py       # Outbound Voice IVR, SMS & WhatsApp delivery logs
│   ├── schemas/              # Pydantic v2 validation models
│   └── services/             # Clean business logic layer
├── tests/                    # Async automated test suite
├── .env.example              # Environment variables template
├── alembic.ini               # Alembic configuration file
├── requirements.txt          # Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ (tested up to Python 3.14)
- PostgreSQL with PostGIS extension (or local SQLite for lightweight development)

### 2. Environment Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase / PostgreSQL credentials:

```ini
# Supabase PostgreSQL connection
DATABASE_URL=postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SYNC_DATABASE_URL=postgresql+psycopg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Local SQLite fallback (default if not set):
# DATABASE_URL=sqlite+aiosqlite:///./indradhanu.db
# SYNC_DATABASE_URL=sqlite:///./indradhanu.db
```

### 4. Run Database Migrations

Apply all schema migrations to create tables and indexes:

```bash
alembic upgrade head
```

To create a new schema migration after updating models:

```bash
alembic revision --autogenerate -m "describe_changes"
```

### 5. Start the Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`.

---

## 📖 API Documentation & Endpoints

Once running, interactive documentation is available:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/api/v1/openapi.json](http://localhost:8000/api/v1/openapi.json)

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Root service & database health check |
| `GET` | `/api/v1/health` | API v1 database connectivity check |
| `GET` | `/api/v1/farmers` | List smallholder farmers (paginated) |
| `POST` | `/api/v1/farmers` | Register a new farmer |
| `GET` | `/api/v1/farmers/{id}` | Farmer profile with associated farms |
| `GET` | `/api/v1/farms` | List farm plots (optional filter by farmer) |
| `POST` | `/api/v1/farms` | Register plot with GPS and soil profile |
| `GET` | `/api/v1/crops` | List crops with phenological stages |
| `POST` | `/api/v1/crops` | Register new crop definition |
| `GET` | `/api/v1/advisories` | List generated advisories |
| `POST` | `/api/v1/advisories` | Create actionable crop advisory |
| `POST` | `/api/v1/advisories/{id}/deliveries` | Record outbound SMS / IVR delivery log |

---

## 🧪 Automated Testing

Run the test suite with pytest:

```bash
pytest -v tests
```

Tests run completely in-memory using an asynchronous SQLite engine and verify:
- Health check endpoints and database connectivity
- Farmer registration and duplicate validation
- Farm plot registration with GPS coordinates
- Advisory generation and outbound delivery logging

