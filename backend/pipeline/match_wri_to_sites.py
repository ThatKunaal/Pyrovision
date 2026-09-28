import pandas as pd
import numpy as np
from scipy.spatial import cKDTree

sites_df = pd.read_csv("final_hybrid_classification.csv")
wri_df = pd.read_csv("wri_power_plants_india.csv")

# NaN lat/lon wali rows hatao (jinke paas geolocation data nahi tha)
wri_df = wri_df.dropna(subset=['latitude', 'longitude']).reset_index(drop=True)
print("Usable WRI plants (with valid coordinates):", len(wri_df))

# KDTree banao WRI plants ke coordinates se
wri_coords = np.radians(wri_df[['latitude', 'longitude']].values)
tree = cKDTree(wri_coords)

site_coords = np.radians(sites_df[['lat_rounded', 'long_rounded']].values)
distances, indices = tree.query(site_coords, k=1)
distances_km = distances * 6371

THRESHOLD_KM = 5.0  # wahi threshold jo OSM match ke liye use kiya tha

sites_df['wri_nearest_name'] = wri_df.iloc[indices]['name'].values
sites_df['wri_distance_km'] = distances_km
sites_df['wri_verified'] = distances_km <= THRESHOLD_KM
sites_df['wri_capacity_mw'] = np.where(sites_df['wri_verified'], wri_df.iloc[indices]['capacity_mw'].values, None)
sites_df['wri_fuel_type'] = np.where(sites_df['wri_verified'], wri_df.iloc[indices]['primary_fuel'].values, None)

verified_count = sites_df['wri_verified'].sum()
print(f"Total sites WRI-verified (within {THRESHOLD_KM}km): {verified_count} / {len(sites_df)}")
print("=" * 50)
print(sites_df[sites_df['wri_verified']][['facility_name', 'wri_nearest_name', 'wri_distance_km', 'wri_capacity_mw', 'wri_fuel_type']].head(20))

sites_df.to_csv("final_with_wri.csv", index=False)
print("Saved: final_with_wri.csv")