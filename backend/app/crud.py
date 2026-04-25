"""
crud.py — ANTON Database Helpers

Note: The primary business logic (NLP analysis, JWT auth, route handling)
lives directly in main.py for clarity in this single-service architecture.
This module provides reusable query helpers for future use or refactoring.
"""

from sqlalchemy.orm import Session
from . import models


def get_user_by_username(db: Session, username: str):
    """Return a User by username, or None if not found."""
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_id(db: Session, user_id: int):
    """Return a User by primary key, or None if not found."""
    return db.query(models.User).get(user_id)


def get_insights_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    """Return paginated InsightRecords for a given user, newest first."""
    return (
        db.query(models.InsightRecord)
        .filter(models.InsightRecord.owner_id == user_id)
        .order_by(models.InsightRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_users(db: Session):
    """Return all registered users."""
    return db.query(models.User).all()
