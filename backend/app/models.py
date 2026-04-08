from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class InsightRecord(Base):
    __tablename__ = "insight_records"

    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    sentiment_score = Column(Float, nullable=True)
    sentiment_label = Column(String, nullable=True)
    word_count = Column(Integer, nullable=True)
    
    # NEW FIELDS
    reading_time = Column(Float, nullable=True)
    key_phrases = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
