from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, farmers, farms, crops, advisories

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Farmer Registration"])
api_router.include_router(farmers.router, prefix="/farmers", tags=["Farmers"])
api_router.include_router(farms.router, prefix="/farms", tags=["Farms"])
api_router.include_router(crops.router, prefix="/crops", tags=["Crops"])
api_router.include_router(advisories.router, prefix="/advisories", tags=["Advisories"])

