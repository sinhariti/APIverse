import time, requests
from fastapi import APIRouter, Path
from db import collection
from bson import ObjectId

router = APIRouter()

@router.get("/api/health-check/{api_id}")
async def check_health(api_id: str = Path(...)):

    doc = collection.find_one({"_id": ObjectId(api_id)})
    url = doc.get("api_url")
    try:
        start = time.time()
        r = requests.get(url)
        latency = round((time.time() - start) * 1000)
        return {"status": "Healthy" if r.ok else "Unhealthy", "latency_ms": latency}
    except:
        return {"status": "Down", "latency_ms": -1}