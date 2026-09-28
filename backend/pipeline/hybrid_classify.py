import pandas as pd
import joblib

df = pd.read_csv("labeled_sites_v2_enriched.csv")
model = joblib.load("wildfire_model.pkl")  # PURANA 2-class model use karo (80.5% wala)

FEATURES = ['days_active', 'total_detections', 'avg_frp', 'max_frp',
            'avg_brightness', 'std_frp', 'night_ratio']

valid_mask = df[FEATURES].notna().all(axis=1)
df.loc[valid_mask, 'ml_prediction'] = model.predict(df.loc[valid_mask, FEATURES])

def final_classify(row):
    if pd.isna(row['ml_prediction']):
        return None
    if row['ml_prediction'] == 'Gas Flare':
        return 'Gas Flare'
    elif row['land_cover_class'] == 'Cropland':
        return 'Crop Residue Burning'
    else:
        return 'Wildfire'

df['final_classification'] = df.apply(final_classify, axis=1)

print(df['final_classification'].value_counts())
df.to_csv("final_hybrid_classification.csv", index=False)
print("Saved: final_hybrid_classification.csv")