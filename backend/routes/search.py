from fastapi import APIRouter, Body
from services.embedding import get_query_embedding, search_apis
from pydantic import BaseModel
from schemas import QueryRequest 


router = APIRouter()
class SearchRequest(BaseModel):
    query: str

@router.post("/api/search")
async def search_apis_route(request: SearchRequest):
    print("Received query:", request.query)
    results = search_apis(request.query)
    # print("Results:", results)
    return results