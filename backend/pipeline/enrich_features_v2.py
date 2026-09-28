import pandas as pd

india_df = pd.read_csv("india_data.csv")
sites_df = pd.read_csv("labeled_sites_v2.csv")

india_df['lat_rounded'] = india_df['latitude'].round(2)
india_df['long_rounded'] = india_df['longitude'].round(2)

radiometric = india_df.groupby(['lat_rounded', 'long_rounded']).agg(
    avg_frp=('frp', 'mean'),
    max_frp=('frp', 'max'),
    avg_brightness=('bright_ti4', 'mean'),
    std_frp=('frp', 'std'),
    night_ratio=('daynight', lambda x: (x == 'N').mean())
).reset_index()

radiometric['std_frp'] = radiometric['std_frp'].fillna(0)

sites_df = sites_df.merge(radiometric, on=['lat_rounded', 'long_rounded'], how='left')

sites_df.to_csv("labeled_sites_v2_enriched.csv", index=False)
print("Saved: labeled_sites_v2_enriched.csv")
print("Total rows:", len(sites_df))