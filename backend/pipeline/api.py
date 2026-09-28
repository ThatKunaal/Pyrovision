from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from supabase import create_client
import os
from dotenv import load_dotenv
import joblib
import pandas as pd
import math

# Secrets load karo
load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Supabase se connect karo
supabase = create_client(url, key)

# Model load karo (sirf ek baar, server start hote waqt)
model = joblib.load("wildfire_model.pkl")
FEATURES = ['days_active', 'total_detections', 'avg_frp', 'max_frp',
            'avg_brightness', 'std_frp', 'night_ratio']

# App banao
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "PYROVISION backend chal raha hai!"}

@app.get("/api/hotspots")
def get_hotspots():
    response = supabase.table('thermal_sites').select("*").execute()
    sites = response.data

    df = pd.DataFrame(sites)

    # Sirf woh rows jinke paas saare 7 features hain (kuch NULL ho sakte hain)
    valid_mask = df[FEATURES].notna().all(axis=1)

    predictions = [None] * len(df)
    if valid_mask.any():
        preds = model.predict(df.loc[valid_mask, FEATURES])
        for idx, pred in zip(df[valid_mask].index, preds):
            predictions[idx] = pred

    df['ai_prediction'] = predictions

    # Dict mein convert karo
    records = df.to_dict('records')

    # Ab NaN ko None se replace karo (yeh yahan reliably kaam karta hai)
    for record in records:
        for key, value in record.items():
            if isinstance(value, float) and math.isnan(value):
                record[key] = None

    return records