from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import medical, acoustic, stock, microbiome

app = FastAPI(
    title="Multi-Domain Signal Viewer API",
    description="Backend API for medical, acoustic, stock, and microbiome signal analysis",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(medical.router, prefix="/api/medical", tags=["medical"])
app.include_router(acoustic.router, prefix="/api/acoustic", tags=["acoustic"])
app.include_router(stock.router, prefix="/api/stock", tags=["stock"])
app.include_router(microbiome.router, prefix="/api/microbiome", tags=["microbiome"])


@app.get("/")
async def root():
    return {
        "message": "Multi-Domain Signal Viewer API",
        "version": "1.0.0",
        "endpoints": {
            "medical": "/api/medical",
            "acoustic": "/api/acoustic",
            "stock": "/api/stock",
            "microbiome": "/api/microbiome"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
