from sqlalchemy.orm import Session
from . import models, schemas, processor

def create_insight(db: Session, insight: schemas.InsightCreate):
    analysis = processor.analyze_text_input(insight.original_text)
    
    db_insight = models.InsightRecord(
        original_text=insight.original_text,
        sentiment_score=analysis["sentiment_score"],
        sentiment_label=analysis["sentiment_label"],
        word_count=analysis["word_count"],
        reading_time=analysis["reading_time"],
        key_phrases=analysis["key_phrases"]
    )
    
    db.add(db_insight)
    db.commit()
    db.refresh(db_insight)
    return db_insight

def get_insights(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.InsightRecord).order_by(models.InsightRecord.created_at.desc()).offset(skip).limit(limit).all()
