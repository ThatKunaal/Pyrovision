from supabase import create_client
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)
print("Connection ban gaya!")

df = pd.read_csv("sites_data.csv")
df['has_facility'] = df['has_facility'].fillna(False)
df['facility_name'] = df['facility_name'].fillna("Not Checked")

records = df.to_dict('records')
response = supabase.table('thermal_sites').insert(records).execute()
print("Data Supabase mein daal diya! Total rows:", len(records))