from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, database, schemas, processor
import nltk

for data in ['brown', 'punkt', 'punkt_tab', 'averaged_perceptron_tagger']:
    nltk.download(data, quiet=True)

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
    try: yield db
    finally: db.close()

@app.get("/")
def read_root(): return {"status": "Online"}

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Taken")
    u = models.User(username=user.username, password=user.password)
    db.add(u); db.commit(); db.refresh(u)
    return u

@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.username == user.username, models.User.password == user.password).first()
    if not u: raise HTTPException(status_code=401)
    return u

@app.post("/analyze")
async def analyze(
    user_id: int = Form(...),
    original_text: Optional[str] = Form(None),
    files: List[UploadFile] = File(None), # Support multiple files
    db: Session = Depends(get_db)
):
    results_count = 0
    
    # Process Multiple Files
    if files and len(files) > 0:
        for file in files:
            content = await file.read()
            text = processor.extract_text_from_pdf(content)
            analysis = processor.analyze_text_input(text)
            record = models.InsightRecord(**analysis, original_text=f"PDF: {file.filename}", owner_id=user_id)
            db.add(record)
            results_count += 1
    
    # Process Text Input
    elif original_text:
        analysis = processor.analyze_text_input(original_text)
        record = models.InsightRecord(**analysis, original_text=original_text[:500], owner_id=user_id)
        db.add(record)
        results_count += 1

    if results_count == 0:
        raise HTTPException(status_code=400, detail="No input provided")

    db.commit()
    return {"status": "Complete", "count": results_count}

@app.get("/history/{user_id}")
def history(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.InsightRecord).filter(models.InsightRecord.owner_id == user_id).all()

@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
