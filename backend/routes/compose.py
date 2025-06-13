# from fastapi import APIRouter, Body, HTTPException
# from motor.motor_asyncio import AsyncIOMotorClient
# from bson import ObjectId
# import aiohttp
# import os
# from dotenv import load_dotenv
# from db import MONGO_URI

# load_dotenv()

# router = APIRouter()

# # MongoDB Setup
# client = AsyncIOMotorClient(MONGO_URI)
# db = client["apiverse"]
# collection = db["apis"]

# @router.post("/api/compose")
# async def compose_workflow(data: dict = Body(...)):
#     workflow = data.get("workflow", [])
#     if not workflow:
#         raise HTTPException(status_code=400, detail="Workflow is empty")

#     result = None

#     async with aiohttp.ClientSession() as session:
#         for step in workflow:
#             api_id = step.get("api_id")
#             params = step.get("params", {})
#             use_prev = step.get("pass_previous_output", False)

#             # Add previous output to current params
#             if use_prev and result:
#                 params["input"] = result  # You can customize the key used

#             # Fetch API metadata from MongoDB
#             api_doc = await collection.find_one({"_id": ObjectId(api_id)})
#             if not api_doc:
#                 raise HTTPException(status_code=404, detail=f"API {api_id} not found")

#             api_url = api_doc["api_url"]

#             # Call the API
#             try:
#                 async with session.get(api_url, params=params) as response:
#                     if response.status != 200:
#                         raise HTTPException(status_code=response.status, detail=f"API {api_id} failed")
#                     result = await response.json()
#             except Exception as e:
#                 raise HTTPException(status_code=500, detail=f"Failed to call API {api_id}: {str(e)}")

#     return {
#         "status": "Workflow executed",
#         "final_output": result
#     }