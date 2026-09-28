from supabase import create_client
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
print("Connection ban gaya!")

df = pd.read_csv("final_hybrid_classification.csv")
df = df.dropna(subset=['final_classification'])

success = 0
failed = 0
for index, row in df.iterrows():
    try:
        supabase.table('thermal_sites').update({
            "land_cover_class": row['land_cover_class'] if pd.notna(row['land_cover_class']) else None,
            "final_classification": row['final_classification']
        }).eq('lat_rounded', row['lat_rounded']).eq('long_rounded', row['long_rounded']).execute()
        success += 1
    except Exception as e:
        print(f"Row {index} fail hua: {e}")
        failed += 1

    if success % 100 == 0:
        print(f"{success} ho gaye...")

print("=" * 50)
print(f"Total updated: {success}, Failed: {failed}")