from supabase import create_client
import os
from dotenv import load_dotenv
import joblib
import pandas as pd

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
print("Connection ban gaya!")

model = joblib.load("wildfire_model.pkl")
FEATURES = ['days_active', 'total_detections', 'avg_frp', 'max_frp',
            'avg_brightness', 'std_frp', 'night_ratio']

# Saara data Supabase se khींचo
response = supabase.table('thermal_sites').select("*").execute()
df = pd.DataFrame(response.data)

# Sirf woh rows jinke paas saare features hain
valid_mask = df[FEATURES].notna().all(axis=1)
valid_df = df[valid_mask].copy()

predictions = model.predict(valid_df[FEATURES])
valid_df['ai_prediction'] = predictions

print(f"Predict ho gaya {len(valid_df)} sites ke liye")

success = 0
failed = 0
for index, row in valid_df.iterrows():
    try:
        supabase.table('thermal_sites').update({
            "ai_prediction": row['ai_prediction']
        }).eq('id', row['id']).execute()
        success += 1
    except Exception as e:
        print(f"Row {index} fail hua: {e}")
        failed += 1

    if success % 100 == 0:
        print(f"{success} ho gaye...")

print("=" * 50)
print(f"Total updated: {success}, Failed: {failed}")