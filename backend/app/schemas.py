"""schemas.py — Pydantic request/response models for ANTON."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters.")
        if len(v) > 30:
            raise ValueError("Username must be at most 30 characters.")
        return v

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return v


class TokenResponse(BaseModel):
    """Returned by POST /login."""
    access_token: str
    token_type: str
    user_id: int
    username: str


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Insights
# ---------------------------------------------------------------------------

class InsightResponse(BaseModel):
    id: int
    original_text: str
    sentiment_score: float
    sentiment_label: str
    subjectivity: float
    readability_grade: str
    word_count: int
    reading_time: float
    key_phrases: str
    ai_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
