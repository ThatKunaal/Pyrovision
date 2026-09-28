import pystac_client
import planetary_computer
import json

catalog = pystac_client.Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace,
)

# Poore India ka bounding box (jo humne pehle bhi use kiya tha)
search = catalog.search(
    collections=["esa-worldcover"],
    bbox=[68, 6, 97, 37],  # west, south, east, north
)

items = list(search.items())
print("Total tiles mile India ke liye:", len(items))

# Har tile ka bbox aur URL save karo
tiles = []
for item in items:
    tiles.append({
        "id": item.id,
        "bbox": item.bbox,  # [west, south, east, north]
        "href": item.assets["map"].href
    })

with open("worldcover_tiles.json", "w") as f:
    json.dump(tiles, f)

print("Saved: worldcover_tiles.json")