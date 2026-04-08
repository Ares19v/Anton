from textblob import TextBlob
import PyPDF2
import io
import textstat

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

def analyze_text_input(text: str):
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity # NEW: 0.0 (Objective) to 1.0 (Subjective)
    
    label = "Positive" if polarity > 0.1 else "Negative" if polarity < -0.1 else "Neutral"
    word_count = len(text.split())
    reading_time = round(word_count / 200, 2)
    
    # NEW: Advanced Readability Metrics
    readability_grade = textstat.text_standard(text, float_output=False)
    
    phrases = list(set(blob.noun_phrases))[:3]
    key_phrases = ", ".join(phrases) if phrases else "None found"
        
    return {
        "sentiment_score": round(polarity, 2),
        "sentiment_label": label,
        "subjectivity": round(subjectivity, 2),
        "readability_grade": readability_grade,
        "word_count": word_count,
        "reading_time": reading_time,
        "key_phrases": key_phrases
    }
