import requests
import pandas as pd

URL = "https://raw.githubusercontent.com/wri/global-power-plant-database/master/source_databases_csv/database_IND.csv"

print("Download ho raha hai...")
response = requests.get(URL, timeout=30)
with open("wri_power_plants_india.csv", "wb") as f:
    f.write(response.content)
print("Saved: wri_power_plants_india.csv")

df = pd.read_csv("wri_power_plants_india.csv")
print("Total India power plants:", len(df))
print(df[['name', 'capacity_mw', 'latitude', 'longitude', 'primary_fuel']].head(10))