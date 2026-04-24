# syntax=docker/dockerfile:1
FROM python:3.11-slim

# Prevent Python from buffering stdout/stderr (important for logs in containers)
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (Docker layer cache optimization)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download NLTK corpora so the container doesn't need internet at runtime
RUN python -c "\
import nltk; \
[nltk.download(d, quiet=True) for d in ['brown', 'punkt', 'punkt_tab', 'averaged_perceptron_tagger']]"

# Copy application source
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
