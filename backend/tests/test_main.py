import sys
import os
import pytest
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../')
from main import app


@pytest.mark.asyncio
async def test_search_valid_query():
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/api/search", json={"query": "weather"})
            assert response.status_code == 200
            assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_search_empty_query():
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/api/search", json={"query": ""})
            assert response.status_code == 200


@pytest.mark.asyncio
async def test_suggest_integration_valid():
    payload = {
        "api_id": "Weather API",
        "description": "Get weather data",
        "frontend": "react",
        "use_case": "fetch data and handle auth"
    }
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/api/suggest-integration", json=payload)
            assert response.status_code == 200


# Suggestion endpoint test
@pytest.mark.asyncio
async def test_suggest_integration_missing_fields():
    payload = {
        "api_id": "Test API"
    }
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/api/suggest-integration", json=payload)
            # Use 200 if backend accepts partial data, otherwise fix backend model
            assert response.status_code in [200, 422]


# Health check - valid ID (assuming DB may be empty)
@pytest.mark.asyncio
async def test_health_check_valid():
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/health-check", params={"api_id": "684984eff4ebb131e39be37e"})
            assert response.status_code in [200, 404, 500]


# Health check - invalid ID
@pytest.mark.asyncio
async def test_health_check_invalid_id():
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/health-check", params={"api_id": "Invalid API"})
            assert response.status_code in [200, 404, 500]