# AI-assisted category/priority classification
KEYWORDS = {
    "Fire": ["smoke", "fire", "burning"],
    "Medical": ["injured", "unconscious", "bleeding", "medical"],
    "Electrical": ["shock", "sparks", "electrical", "panel"],
    "Water": ["flood", "leak", "pipe", "water"],
    "Security": ["theft", "intruder", "suspicious"],
}

def classify(description: str, given_category: str):
    text = description.lower()
    best_match, best_score = given_category, 0.5
    for category, words in KEYWORDS.items():
        matches = sum(1 for w in words if w in text)
        if matches > 0:
            confidence = min(0.6 + matches * 0.15, 0.97)
            if confidence > best_score:
                best_match, best_score = category, confidence
    priority = "Critical" if best_score > 0.85 else "High" if best_score > 0.7 else "Medium"
    return {"category": best_match, "priority": priority, "confidence": round(best_score, 2)}