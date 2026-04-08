from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models, database, schemas, crud

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Insight Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "Online", "engine": "Insight Engine Logic Active"}

# POST: Send text to the engine for analysis
@app.post("/analyze", response_model=schemas.InsightResponse)
def analyze_data(insight: schemas.InsightCreate, db: Session = Depends(get_db)):
    return crud.create_insight(db=db, insight=insight)

# GET: Retrieve all previous insights
@app.get("/history", response_model=List[schemas.InsightResponse])
def get_history(db: Session = Depends(get_db)):
    return crud.get_insights(db=db)
