from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.api.proposal_routes import router
from backend.database import Base, engine
from ml.vector_store import load_past_projects

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="AI Proposal Evaluation System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folders
app.mount("/reports", StaticFiles(directory="reports"), name="reports")
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Include API routes
app.include_router(router)

# Serve index.html at root
@app.get("/")
async def serve_root():
    return FileResponse("frontend/static/index.html")

# Load vector DB on startup
@app.on_event("startup")
def startup_event():
    load_past_projects()
