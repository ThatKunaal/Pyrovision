from supabase import create_client
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
print("Connection ban gaya!")

df = pd.read_csv("sites_data_updated.csv")
df['has_facility'] = df['has_facility'].fillna(False)
df['facility_name'] = df['facility_name'].fillna("Not Checked")

success = 0
failed = 0

for index, row in df.iterrows():
    try:
        supabase.table('thermal_sites').update({
            "has_facility": bool(row['has_facility']),
            "facility_name": row['facility_name']
        }).eq('lat_rounded', row['lat_rounded']).eq('long_rounded', row['long_rounded']).execute()
        success += 1
    except Exception as e:
        print(f"Row {index} update fail hua: {e}")
        failed += 1

    if (index + 1) % 100 == 0:
        print(f"{index + 1}/{len(df)} rows ho gaye...")

print("=" * 50)
print(f"Total updated: {success}, Failed: {failed}")