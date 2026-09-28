import pandas as pd
import json

df = pd.read_csv("wri_power_plants_india.csv")
df = df.dropna(subset=['latitude', 'longitude'])

plants = df[['name', 'capacity_mw', 'latitude', 'longitude', 'primary_fuel']].to_dict('records')

with open("wri_power_plants.json", "w") as f:
    json.dump(plants, f)

print(f"Saved {len(plants)} power plants to wri_power_plants.json")