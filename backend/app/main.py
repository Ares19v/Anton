from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, database, schemas, crud, processor
import os

# FORCE REBUILD: This deletes the old DB if it exists so SQLAlchemy creates the new tables
if os.path.exists("insight_engine.db"):
    os.remove("insight_engine.db")

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

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
    return {"status": "Online", "message": "Anton Intelligence Engine Active"}

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username taken")
    new_user = models.User(username=user.username, password=user.password)
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user

@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.username == user.username, 
        models.User.password == user.password
    ).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return db_user

@app.post("/analyze")
@app.post("/analyze/")
async def analyze(
    user_id: int = Form(...),
    original_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        text = ""
        if file:
            content = await file.read()
            text = processor.extract_text_from_pdf(content)
        else:
            text = original_text
        
        if not text:
            raise HTTPException(status_code=400, detail="No content provided")

        analysis = processor.analyze_text_input(text)
        
        # Mapping the data to the new model with owner_id
        db_insight = models.InsightRecord(
            **analysis, 
            original_text=text[:1000], # Save first 1000 chars for safety
            owner_id=user_id
        )
        db.add(db_insight)
        db.commit()
        db.refresh(db_insight)
        return db_insight
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Processing Error")

@app.get("/history/{user_id}")
def history(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.InsightRecord).filter(
        models.InsightRecord.owner_id == user_id
    ).order_by(models.InsightRecord.created_at.desc()).all()
