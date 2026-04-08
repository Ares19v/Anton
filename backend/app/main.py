from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database, schemas, crud, processor
import nltk

# 1. Force Download NLP Data
try:
    nltk.download('brown', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except:
    pass

# 2. Setup DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# 3. Open ALL CORS
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

# 4. Root Routes (Allows HEAD/GET/POST to prevent 405 errors)
@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"status": "Online"}

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user: raise HTTPException(status_code=400, detail="Taken")
    new_user = models.User(username=user.username, password=user.password)
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user

@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    user_db = db.query(models.User).filter(models.User.username == user.username, models.User.password == user.password).first()
    if not user_db: raise HTTPException(status_code=401)
    return user_db

@app.post("/analyze")
async def analyze(user_id: int = Form(...), original_text: str = Form(None), file: UploadFile = File(None), db: Session = Depends(get_db)):
    text = ""
    if file:
        text = processor.extract_text_from_pdf(await file.read())
    else:
        text = original_text
    
    if not text: raise HTTPException(status_code=400)
    
    res = processor.analyze_text_input(text)
    record = models.InsightRecord(**res, original_text=text[:500], owner_id=user_id)
    db.add(record); db.commit(); db.refresh(record)
    return record

@app.get("/history/{user_id}")
def history(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.InsightRecord).filter(models.InsightRecord.owner_id == user_id).all()
