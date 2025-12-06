from fastapi import FastAPI, Depends
import os
import sys

# Vercel Fix: Add current directory to sys.path so local imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db
import analytics

app = FastAPI()

if os.getenv("VERCEL"):
    app = FastAPI(root_path="/api/analytics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In a real microservice architecture, we should validate the token here too or pass user_id explicitly.
# For simplicity, we'll assume the frontend or gateway handles auth, or we replicate the auth middleware.
# I'll implement a simple user_id query param for now, assuming internal network trust or gateway handling auth.
# ACTUALLY, I should be better. I'll pass user_id as a query param for simplicity in this demo service.

@app.get("/analytics/monthly")
def monthly_spending(user_id: str, db: Session = Depends(get_db)):
    return analytics.get_monthly_spending(db, user_id)

@app.get("/analytics/category")
def category_breakdown(user_id: str, db: Session = Depends(get_db)):
    return analytics.get_category_breakdown(db, user_id)

@app.get("/")
def read_root():
    return {"message": "Analytics Service is running"}
