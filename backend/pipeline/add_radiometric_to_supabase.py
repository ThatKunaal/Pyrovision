from supabase import create_client
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
print("Connection ban gaya!")

df = pd.read_csv("labeled_sites_enriched.csv")

success = 0
failed = 0

for index, row in df.iterrows():
    try:
        supabase.table('thermal_sites').update({
            "avg_frp": float(row['avg_frp']),
            "max_frp": float(row['max_frp']),
            "avg_brightness": float(row['avg_brightness']),
            "std_frp": float(row['std_frp']),
            "night_ratio": float(row['night_ratio'])
        }).eq('lat_rounded', row['lat_rounded']).eq('long_rounded', row['long_rounded']).execute()
        success += 1
    except Exception as e:
        print(f"Row {index} fail hua: {e}")
        failed += 1

    if (index + 1) % 100 == 0:
        print(f"{index + 1}/{len(df)} ho gaye...")

print("=" * 50)
print(f"Total updated: {success}, Failed: {failed}")