from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InsightBase(BaseModel):
    original_text: str

class InsightCreate(InsightBase):
    pass

class InsightResponse(InsightBase):
    id: int
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    word_count: Optional[int] = None
    reading_time: Optional[float] = None
    key_phrases: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
