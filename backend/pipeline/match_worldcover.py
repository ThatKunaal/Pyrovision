import pandas as pd
import json
import rasterio
from rasterio.windows import Window

# Tiles list load karo
with open("worldcover_tiles.json") as f:
    tiles = json.load(f)

# Sites load karo
sites_df = pd.read_csv("sites_data_updated.csv")

def find_tile_for_point(lat, lon, tiles):
    for t in tiles:
        west, south, east, north = t['bbox']
        if west <= lon <= east and south <= lat <= north:
            return t
    return None

# Har site ke liye uska sahi tile dhoondho, aur tile-wise group karo
site_tile_map = {}
for idx, row in sites_df.iterrows():
    tile = find_tile_for_point(row['lat_rounded'], row['long_rounded'], tiles)
    if tile:
        site_tile_map.setdefault(tile['id'], []).append(idx)

print("Total unique tiles chahiye:", len(site_tile_map))

land_cover_codes = [None] * len(sites_df)
tiles_by_id = {t['id']: t for t in tiles}

# Har tile ko sirf EK BAAR kholo, uske saare sites ek saath process karo
for i, (tile_id, indices) in enumerate(site_tile_map.items(), 1):
    href = tiles_by_id[tile_id]['href']
    try:
        with rasterio.open(href) as src:
            for idx in indices:
                lat = sites_df.loc[idx, 'lat_rounded']
                lon = sites_df.loc[idx, 'long_rounded']
                row, col = src.index(lon, lat)
                window = Window(col, row, 1, 1)
                value = src.read(1, window=window)
                land_cover_codes[idx] = int(value[0][0])
        print(f"[{i}/{len(site_tile_map)}] Tile {tile_id} done ({len(indices)} sites)")
    except Exception as e:
        print(f"[{i}/{len(site_tile_map)}] Tile {tile_id} FAILED: {e}")

sites_df['land_cover_code'] = land_cover_codes

# Codes ko readable naam mein convert karo
LAND_COVER_MAP = {
    10: "Tree Cover", 20: "Shrubland", 30: "Grassland", 40: "Cropland",
    50: "Built-up", 60: "Bare/Sparse Vegetation", 70: "Snow/Ice",
    80: "Water Bodies", 90: "Herbaceous Wetland", 95: "Mangroves", 100: "Moss/Lichen"
}
sites_df['land_cover_class'] = sites_df['land_cover_code'].map(LAND_COVER_MAP)

sites_df.to_csv("sites_data_with_landcover.csv", index=False)
print("=" * 50)
print("Saved: sites_data_with_landcover.csv")
print(sites_df['land_cover_class'].value_counts())