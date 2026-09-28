from supabase import create_client
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
print("Connection ban gaya!")

df = pd.read_csv("final_with_coal.csv")

success = 0
failed = 0

for index, row in df.iterrows():
    update_data = {}

    if row.get('wri_verified') == True:
        update_data["wri_verified"] = True
        update_data["wri_capacity_mw"] = float(row['wri_capacity_mw']) if pd.notna(row['wri_capacity_mw']) else None
        update_data["wri_fuel_type"] = row['wri_fuel_type'] if pd.notna(row['wri_fuel_type']) else None
        update_data["wri_plant_name"] = row['wri_nearest_name'] if pd.notna(row['wri_nearest_name']) else None

    if row.get('coal_verified') == True:
        update_data["coal_verified"] = True
        update_data["coal_mine_name"] = row['coal_mine_name'] if pd.notna(row['coal_mine_name']) else None
        update_data["coal_owner"] = row['coal_owner'] if pd.notna(row['coal_owner']) else None
        update_data["coal_type"] = row['coal_type'] if pd.notna(row['coal_type']) else None

    if not update_data:
        continue

    try:
        supabase.table('thermal_sites').update(update_data).eq(
            'lat_rounded', row['lat_rounded']
        ).eq('long_rounded', row['long_rounded']).execute()
        success += 1
    except Exception as e:
        print(f"Row {index} fail hua: {e}")
        failed += 1

print("=" * 50)
print(f"Total updated: {success}, Failed: {failed}")