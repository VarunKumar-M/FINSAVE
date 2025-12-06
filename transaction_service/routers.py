from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, dependencies
from database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.TransactionOut)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(dependencies.get_current_user)
):
    new_transaction = models.Transaction(**transaction.dict(), user_id=current_user)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@router.get("/", response_model=List[schemas.TransactionOut])
def read_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: str = Depends(dependencies.get_current_user)
):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user).offset(skip).limit(limit).all()
    return transactions
