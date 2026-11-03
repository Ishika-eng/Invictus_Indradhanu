from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, farmers, farms, farm_crops, crops, climate, advisories

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Farmer Registration"])
api_router.include_router(farmers.router, prefix="/farmers", tags=["Farmers"])
api_router.include_router(farms.router, prefix="/farms", tags=["Farms"])
api_router.include_router(farm_crops.router, prefix="/farms", tags=["Farm Crop Management"])
api_router.include_router(climate.router, prefix="/farms", tags=["Climate Integration"])
api_router.include_router(crops.router, prefix="/crops", tags=["Crops"])
api_router.include_router(advisories.router, prefix="/advisories", tags=["Advisories"])

