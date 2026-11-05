import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_cors_preflight_auth_me():
    """Verify that OPTIONS preflight request to /api/v1/auth/me from http://localhost:3000 succeeds with proper CORS headers."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.options(
            "/api/v1/auth/me",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization, content-type",
            },
        )
        assert res.status_code == 200
        assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
        assert res.headers.get("access-control-allow-credentials") == "true"
        allow_methods = res.headers.get("access-control-allow-methods", "")
        assert "GET" in allow_methods
        assert "OPTIONS" in allow_methods
        allow_headers = res.headers.get("access-control-allow-headers", "").lower()
        assert "authorization" in allow_headers
        assert "content-type" in allow_headers


@pytest.mark.asyncio
async def test_cors_preflight_register_farmer():
    """Verify that OPTIONS preflight request to /api/v1/auth/register-farmer from http://localhost:3000 succeeds."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.options(
            "/api/v1/auth/register-farmer",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization, content-type",
            },
        )
        assert res.status_code == 200
        assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
        assert res.headers.get("access-control-allow-credentials") == "true"
        allow_methods = res.headers.get("access-control-allow-methods", "")
        assert "POST" in allow_methods
        allow_headers = res.headers.get("access-control-allow-headers", "").lower()
        assert "authorization" in allow_headers
        assert "content-type" in allow_headers


@pytest.mark.asyncio
async def test_cors_actual_get_auth_me():
    """Verify that GET /api/v1/auth/me returns CORS headers even when unauthorized (401)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get(
            "/api/v1/auth/me",
            headers={
                "Origin": "http://localhost:3000",
            },
        )
        assert res.status_code == 401
        assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
        assert res.headers.get("access-control-allow-credentials") == "true"
        # Must not be wildcard
        assert res.headers.get("access-control-allow-origin") != "*"


@pytest.mark.asyncio
async def test_cors_actual_post_register_farmer():
    """Verify that POST /api/v1/auth/register-farmer returns CORS headers even on 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/auth/register-farmer",
            headers={
                "Origin": "http://localhost:3000",
                "Content-Type": "application/json",
            },
            json={},
        )
        assert res.status_code == 401
        assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
        assert res.headers.get("access-control-allow-credentials") == "true"
        assert res.headers.get("access-control-allow-origin") != "*"


@pytest.mark.asyncio
async def test_cors_preserves_other_development_origins():
    """Verify that http://localhost:5173, http://127.0.0.1:3000, and http://localhost:8081 receive valid CORS headers."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for origin in ["http://localhost:5173", "http://127.0.0.1:3000", "http://localhost:8081"]:
            res = await client.options(
                "/api/v1/auth/me",
                headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "GET",
                    "Access-Control-Request-Headers": "authorization",
                },
            )
            assert res.status_code == 200
            assert res.headers.get("access-control-allow-origin") == origin
            assert res.headers.get("access-control-allow-credentials") == "true"


@pytest.mark.asyncio
async def test_cors_rejects_unauthorized_external_origin():
    """Verify that arbitrary external origins are not reflected in CORS headers."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.options(
            "/api/v1/auth/me",
            headers={
                "Origin": "http://malicious-website.example.com",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Starlette returns 400 for disallowed CORS preflight and does not set allow-origin
        assert res.headers.get("access-control-allow-origin") != "http://malicious-website.example.com"
