from textblob import TextBlob

def analyze_text_input(text: str):
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.1:
        label = "Positive"
    elif polarity < -0.1:
        label = "Negative"
    else:
        label = "Neutral"
        
    word_count = len(text.split())
    # Calculate reading time based on 200 words per minute
    reading_time = round(word_count / 200, 2)
    
    # Extract unique noun phrases, take top 3
    phrases = list(set(blob.noun_phrases))[:3]
    key_phrases = ", ".join(phrases) if phrases else "None found"
        
    return {
        "sentiment_score": round(polarity, 2),
        "sentiment_label": label,
        "word_count": word_count,
        "reading_time": reading_time,
        "key_phrases": key_phrases
    }
