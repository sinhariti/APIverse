from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from db import collection, reviews
import math

router = APIRouter()

def serialize_doc(doc):
    # Helper function to handle NaN values
    def sanitize_value(val):
        if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
            return None  # Convert NaN/Infinity to None (null in JSON)
        return val
    
    return {
        "_id": str(doc.get("_id")),
        "name": sanitize_value(doc.get("name")),
        "description": sanitize_value(doc.get("description")),
        "category": sanitize_value(doc.get("category")),
        "auth": sanitize_value(doc.get("authentication_type")),
        "cors": sanitize_value(doc.get("cors_support")),
        "rating": sanitize_value(doc.get("rating")),
        "health_score": sanitize_value(doc.get("health_score")),
        "api_url": sanitize_value(doc.get("api_url")),
        "website": sanitize_value(doc.get("link")),
    }

class CategoryFilterRequest(BaseModel):
    categories: str

@router.post("/api/filter_by_categories")
async def filter_by_categories(payload: CategoryFilterRequest):
    if not payload.categories:
        raise HTTPException(status_code=400, detail="Category must be provided.")

    try:
        # Clean and prepare search term
        search_term = payload.categories.strip()
        print(f"Searching for: '{search_term}'")
        
        query = {"category": {"$regex": f"\\b{search_term}\\b", "$options": "i"}}
        
        cursor = collection.find(query)
        
        # Process with better error handling
        apis = []
        for doc in cursor:
            try:
                serialized = serialize_doc(doc)
                apis.append(serialized)
            except Exception as doc_err:
                print(f"Error processing document {doc.get('_id', 'unknown')}: {doc_err}")
                # Continue processing other documents
        
        return apis
    except Exception as e:
        print(f"Filter error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error filtering categories: {str(e)}")
  
    