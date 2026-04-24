from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base  # Base is now a DeclarativeBase subclass

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    insights = relationship("InsightRecord", back_populates="owner")

class InsightRecord(Base):
    __tablename__ = "insight_records"
    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text)
    sentiment_score = Column(Float)
    sentiment_label = Column(String)
    subjectivity = Column(Float)
    readability_grade = Column(String)
    word_count = Column(Integer)
    reading_time = Column(Float)
    key_phrases = Column(String)
    ai_summary = Column(Text, nullable=True) # <-- THE DATABASE COLUMN
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="insights")
