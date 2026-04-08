from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, database, schemas, crud, processor

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Anton API")

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
    return {"status": "Online", "engine": "Anton Logic Active"}

# NEW: Accepts multipart/form-data for files
@app.post("/analyze", response_model=schemas.InsightResponse)
async def analyze_data(
    original_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    text_to_analyze = ""
    
    if file and file.filename.endswith('.pdf'):
        content = await file.read()
        text_to_analyze = processor.extract_text_from_pdf(content)
    elif original_text:
        text_to_analyze = original_text
    else:
        raise HTTPException(status_code=400, detail="Provide text or a PDF.")

    insight = schemas.InsightCreate(original_text=text_to_analyze)
    return crud.create_insight(db=db, insight=insight)

@app.get("/history", response_model=List[schemas.InsightResponse])
def get_history(db: Session = Depends(get_db)):
    return crud.get_insights(db=db)
