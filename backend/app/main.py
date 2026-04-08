from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database, schemas, processor
import nltk

# Pre-download NLP data
for data in ['brown', 'punkt', 'punkt_tab', 'averaged_perceptron_tagger']:
    nltk.download(data, quiet=True)

# Initialize DB structure
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Standard Industrial CORS - This is the standard way to fix the "No Header" error
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

@app.get("/")
def read_root():
    return {"status": "Online", "message": "Anton Pro Active"}

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user: raise HTTPException(status_code=400, detail="Username taken")
    new_user = models.User(username=user.username, password=user.password)
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user

@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username, models.User.password == user.password).first()
    if not db_user: raise HTTPException(status_code=401, detail="Invalid credentials")
    return db_user

@app.post("/analyze")
async def analyze(user_id: int = Form(...), original_text: str = Form(None), file: UploadFile = File(None), db: Session = Depends(get_db)):
    text = ""
    if file:
        content = await file.read()
        text = processor.extract_text_from_pdf(content)
    else:
        text = original_text
    
    if not text: raise HTTPException(status_code=400, detail="No content")

    analysis = processor.analyze_text_input(text)
    db_insight = models.InsightRecord(**analysis, original_text=text[:500], owner_id=user_id)
    db.add(db_insight); db.commit(); db.refresh(db_insight)
    return db_insight

@app.get("/history/{user_id}")
def history(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.InsightRecord).filter(models.InsightRecord.owner_id == user_id).all()

@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
