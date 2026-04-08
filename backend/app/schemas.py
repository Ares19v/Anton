from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class InsightBase(BaseModel):
    original_text: str

class InsightCreate(InsightBase):
    owner_id: int

class InsightResponse(InsightBase):
    id: int
    sentiment_score: float
    sentiment_label: str
    word_count: int
    reading_time: float
    key_phrases: str
    created_at: datetime
    class Config: from_attributes = True

class UserResponse(UserBase):
    id: int
    insights: List[InsightResponse] = []
    class Config: from_attributes = True
