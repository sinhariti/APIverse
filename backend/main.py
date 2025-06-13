### === main.py ===
from fastapi import FastAPI
from routes import search, integration, health, compose, review, categories
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add this middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # <-- your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(search.router)
app.include_router(integration.router)
app.include_router(health.router)
# app.include_router(compose.router)
app.include_router(review.router)
app.include_router(categories.router)

@app.get("/")
def root():
    return {"message": "Welcome to APIVerse backend"}