"""
conftest.py — Pytest configuration and shared fixtures for ANTON backend tests.
"""
import os

# ---------------------------------------------------------------------------
# Set environment variables BEFORE any app module is imported.
# ---------------------------------------------------------------------------
os.environ["SECRET_KEY"] = "ci-test-secret-key-not-for-production"
os.environ["ADMIN_KEY"] = "ci-test-admin-key"
os.environ["GROQ_API_KEY"] = "fake-key-groq-calls-will-gracefully-fail"
os.environ["DATABASE_URL"] = "sqlite:///./test_anton.db"

# Delete stale test database from a previous run BEFORE importing the app,
# so each test session always starts completely fresh.
_db_path = "./test_anton.db"
if os.path.exists(_db_path):
    os.remove(_db_path)
