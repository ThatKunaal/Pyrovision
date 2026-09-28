from supabase import create_client
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
print("Connection ban gaya!")

response = supabase.table('thermal_sites').select("*").execute()
df = pd.DataFrame(response.data)
print("Total sites:", len(df))

def categorize(row):
    fc = row.get('final_classification')

    if fc == 'Crop Residue Burning':
        return 'Agriculture Fire'

    elif fc == 'Wildfire':
        return 'Wild Fire'

    elif fc == 'Gas Flare':
        # Pehle Coal-Mine se check karo
        if row.get('coal_verified'):
            return 'Mining Activity'

        # Phir facility-name mein gas/flare/oil-related keywords dhoondho
        name = str(row.get('facility_name') or '').lower()
        flare_keywords = ['gas', 'flare', 'refinery', 'petro', 'oil']
        if any(kw in name for kw in flare_keywords):
            return 'Gas Flare'

        # Baaki sab industrial-facilities (steel, cement, etc.)
        return 'Industrial Fire'

    return None  # jahan final_classification khud missing hai

df['industrial_category'] = df.apply(categorize, axis=1)

print("=" * 50)
print(df['industrial_category'].value_counts())

success = 0
failed = 0
for _, row in df.iterrows():
    if pd.isna(row['industrial_category']):
        continue
    try:
        supabase.table('thermal_sites').update({
            "industrial_category": row['industrial_category']
        }).eq('id', row['id']).execute()
        success += 1
    except Exception as e:
        print(f"Row {row['id']} fail hua: {e}")
        failed += 1

print("=" * 50)
print(f"Total updated: {success}, Failed: {failed}")