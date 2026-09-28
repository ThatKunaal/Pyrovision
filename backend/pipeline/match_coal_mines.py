import pandas as pd
import numpy as np
from scipy.spatial import cKDTree
import kagglehub
import os

path = kagglehub.dataset_download("shitalgaikwad123/indian-coal-mines-dataset-january-20211")
xlsx_file = [f for f in os.listdir(path) if f.endswith('.xlsx')][0]
coal_df = pd.read_excel(os.path.join(path, xlsx_file))

# Column names mein trailing spaces hain ('Latitude ', 'Longitude ') — clean karo
coal_df.columns = coal_df.columns.str.strip()

coal_df = coal_df.dropna(subset=['Latitude', 'Longitude']).reset_index(drop=True)
print("Usable coal mines (with coordinates):", len(coal_df))

sites_df = pd.read_csv("final_with_wri.csv")

coal_coords = np.radians(coal_df[['Latitude', 'Longitude']].values)
tree = cKDTree(coal_coords)

site_coords = np.radians(sites_df[['lat_rounded', 'long_rounded']].values)
distances, indices = tree.query(site_coords, k=1)
distances_km = distances * 6371

THRESHOLD_KM = 5.0  # wahi threshold jo WRI ke liye use kiya tha

sites_df['coal_mine_name'] = coal_df.iloc[indices]['Mine Name'].values
sites_df['coal_distance_km'] = distances_km
sites_df['coal_verified'] = distances_km <= THRESHOLD_KM
sites_df['coal_owner'] = np.where(sites_df['coal_verified'], coal_df.iloc[indices]['Coal Mine Owner Name'].values, None)
sites_df['coal_type'] = np.where(sites_df['coal_verified'], coal_df.iloc[indices]['Type of Mine (OC/UG/Mixed)'].values, None)

verified_count = sites_df['coal_verified'].sum()
print(f"Total sites Coal-Mine-verified (within {THRESHOLD_KM}km): {verified_count} / {len(sites_df)}")
print("=" * 50)
print(sites_df[sites_df['coal_verified']][['facility_name', 'coal_mine_name', 'coal_distance_km', 'coal_owner', 'coal_type']].head(20))

sites_df.to_csv("final_with_coal.csv", index=False)
print("Saved: final_with_coal.csv")