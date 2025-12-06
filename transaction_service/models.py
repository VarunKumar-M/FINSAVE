from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    category = Column(String)
    notes = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, index=True) # Storing username or user ID from JWT
