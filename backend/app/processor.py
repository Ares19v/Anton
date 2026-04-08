from textblob import TextBlob
import PyPDF2
import io
import textstat
import os
from groq import Groq

# Initialize Groq client (API Key will be pulled from Render Env Vars)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted: text += extracted + "\n"
    return text

def get_ai_summary(text: str):
    try:
        # We ask the AI to be brief and "Action-Oriented"
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are Anton AI. Summarize the text in 1 sentence and provide 1 'Suggested Action' (e.g. Action: High Priority Response)."},
                {"role": "user", "content": f"Analyze this: {text[:2000]}"}
            ],
            model="llama3-8b-8192",
            max_tokens=100
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Summary unavailable: {str(e)}"

def analyze_text_input(text: str):
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity
    
    label = "Positive" if polarity > 0.1 else "Negative" if polarity < -0.1 else "Neutral"
    
    return {
        "sentiment_score": round(polarity, 2),
        "sentiment_label": label,
        "subjectivity": round(subjectivity, 2),
        "readability_grade": textstat.text_standard(text),
        "word_count": len(text.split()),
        "reading_time": round(len(text.split()) / 200, 2),
        "key_phrases": ", ".join(list(set(blob.noun_phrases))[:3]) or "None",
        "ai_summary": get_ai_summary(text) # NEW
    }
