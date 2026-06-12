from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.product_routes import router as product_router
from app.routes.review_routes import router as review_router

app = FastAPI(
    title="TrustMart AI",
    description="AI Powered Amazon Product Trust Analysis",
    version="1.0.0"
)

# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes

app.include_router(product_router)
app.include_router(review_router)

# Home Route

@app.get("/")
def home():
    return {
        "message": "TrustMart API Running"
    }