from fastapi import APIRouter, Body
from services.gemini_integration import generate_code_snippet

router = APIRouter()

@router.post("/api/suggest-integration")
async def suggest_integration(data: dict = Body(...)):
    code = await generate_code_snippet(data)
    return {"code_snippet": code}