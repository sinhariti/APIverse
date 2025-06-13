from fastapi import APIRouter, Body, Path
from db import reviews
from datetime import datetime

router = APIRouter()

@router.post("/api/review/{api_id}")
async def post_review(api_id: str, data: dict = Body(...)):
    data.update({"api_id": api_id, "timestamp": datetime.utcnow()})
    reviews.insert_one(data)
    return {"message": "Review submitted"}

@router.get("/api/review/{api_id}")
async def get_reviews(api_id: str):
    return list(reviews.find({"api_id": api_id}, {"_id": 0}))