from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database, schemas, processor

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
    u = db.query(models.User).filter(models.User.username == user.username, models.User.password == user.password).first()
    if not u: raise HTTPException(status_code=401)
    return u

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
@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

def history(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.InsightRecord).filter(models.InsightRecord.owner_id == user_id).all()

@app.get("/secret-admin-users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{"id": u.id, "username": u.username} for u in users]
