import pystac_client
import planetary_computer
import rasterio
from rasterio.windows import Window

# Planetary Computer ka STAC catalog kholo (signed URLs auto-milte hain)
catalog = pystac_client.Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace,
)

# Test point — tumhara site 2903 (8.02, 81.42)
lat, lon = 8.02, 81.42

search = catalog.search(
    collections=["esa-worldcover"],
    intersects={"type": "Point", "coordinates": [lon, lat]},
)
items = list(search.items())
print("Items mile:", len(items))

if items:
    item = items[0]
    print("Tile ID:", item.id)
    asset = item.assets["map"]

    with rasterio.open(asset.href) as src:
        row, col = src.index(lon, lat)
        window = Window(col, row, 1, 1)
        value = src.read(1, window=window)
        print("Land Cover Class Code:", value[0][0])
else:
    print("Koi tile nahi mili is point ke liye")