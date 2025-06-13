from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from db import collection, reviews

router = APIRouter()

def serialize_doc(doc):
    return {
        "id": str(doc.get("_id")),
        "name": doc.get("name"),
        "description": doc.get("description"),
        "category": doc.get("category"),
        "auth": doc.get("authentication_type"),
        "cors": doc.get("cors_support"),
        "rating": doc.get("rating"),
        "health_score": doc.get("health_score"),
        "api_url": doc.get("api_url"),
        "website": doc.get("link"),
    }

class CategoryFilterRequest(BaseModel):
    categories: List[str]

@router.post("/api/filter_by_categories")
async def filter_by_categories(payload: CategoryFilterRequest):
    if not payload.categories:
        raise HTTPException(status_code=400, detail="At least one category must be provided.")

    try:
        # Build regex filters for each category
        regex_filters = [{"category": {"$regex": fr"\b{cat.strip()}\b", "$options": "i"}} for cat in payload.categories]

        # Combine with $or
        cursor = collection.find({"$or": regex_filters})
        apis = [serialize_doc(doc) for doc in cursor]
        return {"count": len(apis), "results": apis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filtering categories: {e}")
    
    