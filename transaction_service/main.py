from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
import models, routers
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

if os.getenv("VERCEL"):
    app = FastAPI(root_path="/api/transactions")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router, prefix="/transactions", tags=["transactions"])

@app.get("/")
def read_root():
    return {"message": "Transaction Service is running"}
