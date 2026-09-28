from supabase import create_client
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
print("Connection ban gaya!")

df = pd.read_csv("final_with_cea.csv")
df_validated = df[df['cea_validated'] == True].copy()

success = 0
failed = 0
for index, row in df_validated.iterrows():
    try:
        supabase.table('thermal_sites').update({
            "cea_capacity_mw": float(row['cea_capacity_mw']),
            "cea_fuel_type": row['cea_fuel_type'],
            "cea_validated": True
        }).eq('lat_rounded', row['lat_rounded']).eq('long_rounded', row['long_rounded']).execute()
        success += 1
    except Exception as e:
        print(f"Row {index} fail hua: {e}")
        failed += 1

print("=" * 50)
print(f"Total updated: {success}, Failed: {failed}")