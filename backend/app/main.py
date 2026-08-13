import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, products, categories, orders, wholesale, quotations, dashboard, content

# Create tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SAI BALAJI SILVERWORKS API",
    description="Full-stack B2C Retail & B2B Wholesale Commerce Platform API for Sai Balaji Silverworks",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(wholesale.router, prefix=settings.API_V1_STR)
app.include_router(quotations.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(content.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "brand": "SAI BALAJI SILVERWORKS",
        "tagline": "Crafted in Silver. Designed to Last.",
        "status": "Operational",
        "docs": "/docs",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
