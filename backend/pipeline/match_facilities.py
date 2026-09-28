import pandas as pd
import json
import numpy as np
from scipy.spatial import cKDTree

# Step A: Saari facilities load karo
with open("all_facilities.json", "r") as f:
    facilities_data = json.load(f)

facilities = []
for el in facilities_data['elements']:
    if el['type'] == 'node':
        lat, lon = el.get('lat'), el.get('lon')
    else:  # way — 'center' use karo
        center = el.get('center', {})
        lat, lon = center.get('lat'), center.get('lon')

    if lat is None or lon is None:
        continue

    name = el.get('tags', {}).get('name', 'Unnamed Facility')
    facilities.append({'lat': lat, 'lon': lon, 'name': name})

fac_df = pd.DataFrame(facilities)
print("Total usable facilities:", len(fac_df))

# Step B: Apni hotspot sites load karo
sites_df = pd.read_csv("sites_data.csv")
print("Total hotspot sites:", len(sites_df))

# Step C: KDTree banao fast nearest-neighbor search ke liye
fac_coords = np.radians(fac_df[['lat', 'lon']].values)
tree = cKDTree(fac_coords)

site_coords = np.radians(sites_df[['lat_rounded', 'long_rounded']].values)

# Step D: Har site ke liye nearest facility dhoondho
distances, indices = tree.query(site_coords, k=1)

# Radians ko kilometers mein convert karo (Earth radius ~6371 km)
distances_km = distances * 6371

sites_df['nearest_facility_name'] = fac_df.iloc[indices]['name'].values
sites_df['nearest_facility_distance_km'] = distances_km

# Step E: Threshold set karo — kitne km ke andar ho to "known" maano
THRESHOLD_KM = 2.0
sites_df['has_facility'] = sites_df['nearest_facility_distance_km'] <= THRESHOLD_KM
sites_df['facility_name'] = np.where(
    sites_df['has_facility'],
    sites_df['nearest_facility_name'],
    None
)

sites_df.to_csv("sites_data_updated.csv", index=False)
print("Saved: sites_data_updated.csv")
print("Known sites ab:", sites_df['has_facility'].sum(), "/", len(sites_df))