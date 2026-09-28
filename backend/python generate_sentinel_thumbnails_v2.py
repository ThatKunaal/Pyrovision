import os
from dotenv import load_dotenv
from supabase import create_client
import pystac_client
import planetary_computer
import rasterio
from rasterio.windows import Window
from rasterio.warp import transform as warp_transform
import numpy as np
from PIL import Image
import pandas as pd

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

geo_df = pd.read_csv("geocoded_facilities.csv")

# NOT FOUND wale sites ke liye Supabase se original coordinates fallback lo
missing_ids = geo_df[geo_df['geocoded_lat'].isna()]['site_id'].tolist()
fallback_coords = {}
if missing_ids:
    resp = supabase.table('thermal_sites').select("id, lat_rounded, long_rounded").in_('id', missing_ids).execute()
    for row in resp.data:
        fallback_coords[row['id']] = (row['lat_rounded'], row['long_rounded'])

os.makedirs("sentinel_thumbnails_v2", exist_ok=True)

catalog = pystac_client.Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace,
)

def make_thumbnail(lat, lon, site_id):
    try:
        search = catalog.search(
            collections=["sentinel-2-l2a"],
            intersects={"type": "Point", "coordinates": [lon, lat]},
            query={"eo:cloud_cover": {"lt": 15}},
            sortby=[{"field": "eo:cloud_cover", "direction": "asc"}],
            limit=1,
        )
        items = list(search.items())
        if not items:
            return False
        item = items[0]

        # "visual" asset = ESA ka pre-made True Color Image (already color-balanced, high quality)
        with rasterio.open(item.assets["visual"].href) as src:
            xs, ys = warp_transform("EPSG:4326", src.crs, [lon], [lat])
            col, row = src.index(xs[0], ys[0])
            half = 250  # ~5km each side at 10m resolution — bada, clearer crop
            window = Window(col - half, row - half, half * 2, half * 2)
            data = src.read([1, 2, 3], window=window)  # RGB bands, already uint8

            if data.size == 0 or data.shape[1] == 0 or data.shape[2] == 0:
                raise ValueError("Empty crop")

            rgb = np.transpose(data, (1, 2, 0))  # (bands, H, W) -> (H, W, bands)

        img = Image.fromarray(rgb)
        img = img.resize((512, 512), Image.LANCZOS)  # sharp, consistent size
        img.save(f"sentinel_thumbnails_v2/{site_id}.jpg", quality=92)
        return True
    except Exception as e:
        print(f"  Failed for site {site_id}: {e}")
        return False

success = 0
total = 0
for _, row in geo_df.iterrows():
    site_id = int(row['site_id'])
    if pd.notna(row['geocoded_lat']):
        lat, lon = row['geocoded_lat'], row['geocoded_lon']
        source = "geocoded"
    elif site_id in fallback_coords:
        lat, lon = fallback_coords[site_id]
        source = "supabase-fallback"
    else:
        print(f"TH-{site_id} — koi coordinates nahi mile, skip")
        continue

    total += 1
    ok = make_thumbnail(lat, lon, site_id)
    print(f"TH-{site_id} ({row['name']}, {source}) - {'OK' if ok else 'SKIP'}")
    if ok:
        success += 1

print("=" * 50)
print(f"Total thumbnails generated: {success}/{total}")