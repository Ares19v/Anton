"""database.py — SQLAlchemy engine and session factory for ANTON."""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Load variables from .env file (no-op if the file doesn't exist)
load_dotenv()

# ---------------------------------------------------------------------------
# Database URL
# Defaults to a local SQLite file for development.
# Override with DATABASE_URL env var for PostgreSQL or other databases.
# ---------------------------------------------------------------------------
SQLALCHEMY_DATABASE_URL: str = os.environ.get(
    "DATABASE_URL", "sqlite:///./anton.db"
)

# SQLite requires the check_same_thread=False workaround for FastAPI's
# async request handling. This arg is ignored for other DB drivers.
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base class for all ORM models."""
    pass
