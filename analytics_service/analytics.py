from sqlalchemy.orm import Session
from sqlalchemy import func
import models

def get_monthly_spending(db: Session, user_id: str):
    # This is a simplified monthly aggregation
    result = db.query(
        func.to_char(models.Transaction.date, 'YYYY-MM').label('month'),
        func.sum(models.Transaction.amount).label('total')
    ).filter(models.Transaction.user_id == user_id).group_by('month').all()
    
    return [{"month": row.month, "total": row.total} for row in result]

def get_category_breakdown(db: Session, user_id: str):
    result = db.query(
        models.Transaction.category,
        func.sum(models.Transaction.amount).label('total')
    ).filter(models.Transaction.user_id == user_id).group_by(models.Transaction.category).all()
    
    return [{"category": row.category, "total": row.total} for row in result]
