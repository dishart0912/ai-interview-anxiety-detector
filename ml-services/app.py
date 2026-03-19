from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("model.pkl")

class MetricsInput(BaseModel):
    response_delay_ms: float
    typing_speed_wpm: float
    answer_length_words: float

@app.post("/predict")
def predict(data: MetricsInput):
    features = np.array([[
        data.response_delay_ms,
        data.typing_speed_wpm,
        data.answer_length_words
    ]])

    score = float(model.predict(features)[0])
    score = round(max(0, min(100, score)), 1)

    if score >= 70:
        anxiety_level = "low"
    elif score >= 45:
        anxiety_level = "moderate"
    else:
        anxiety_level = "high"

    delay_ok = data.response_delay_ms < 3000
    speed_ok = data.typing_speed_wpm > 40
    length_ok = data.answer_length_words > 50

    tips = []
    if not delay_ok:
        tips.append("Try to respond within 3 seconds — long pauses signal hesitation")
    if not speed_ok:
        tips.append("Type more naturally — very slow typing can indicate uncertainty")
    if not length_ok:
        tips.append("Give fuller answers — aim for at least 50 words per response")
    if not tips:
        tips.append("Great behavioral signals — keep it up")

    return {
        "ml_confidence_score": score,
        "anxiety_level": anxiety_level,
        "breakdown": {
            "delay": {
                "value": round(data.response_delay_ms / 1000, 1),
                "unit": "seconds",
                "impact": "positive" if delay_ok else "negative",
                "label": "Response delay"
            },
            "speed": {
                "value": round(data.typing_speed_wpm, 1),
                "unit": "WPM",
                "impact": "positive" if speed_ok else "negative",
                "label": "Typing speed"
            },
            "length": {
                "value": int(data.answer_length_words),
                "unit": "words",
                "impact": "positive" if length_ok else "negative",
                "label": "Answer length"
            }
        },
        "behavioral_tips": tips
    }

@app.get("/health")
def health():
    return {"status": "ok"}