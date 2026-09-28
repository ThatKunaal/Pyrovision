import requests
import json
import time

# India ka pura bounding box: (south, west, north, east)
FULL_BBOX = (6, 68, 37, 97)

def make_grid(bbox, rows=3, cols=3):
    south, west, north, east = bbox
    lat_step = (north - south) / rows
    lon_step = (east - west) / cols
    tiles = []
    for r in range(rows):
        for c in range(cols):
            s = south + r * lat_step
            n = south + (r + 1) * lat_step
            w = west + c * lon_step
            e = west + (c + 1) * lon_step
            tiles.append((s, w, n, e))
    return tiles

def fetch_tile(bbox, tile_num, total_tiles, retries=3):
    s, w, n, e = bbox
    query = f"""
    [out:json][timeout:90];
    (
      node["landuse"="industrial"]({s},{w},{n},{e});
      way["landuse"="industrial"]({s},{w},{n},{e});
      node["power"="plant"]({s},{w},{n},{e});
      way["power"="plant"]({s},{w},{n},{e});
      node["man_made"="works"]({s},{w},{n},{e});
      way["man_made"="works"]({s},{w},{n},{e});
    );
    out center;
    """
    headers = {"User-Agent": "PyrovisionApp/1.0"}

    for attempt in range(1, retries + 1):
        print(f"Tile {tile_num}/{total_tiles} — attempt {attempt}...")
        try:
            response = requests.post(
                "https://overpass-api.de/api/interpreter",
                data={"data": query},
                headers=headers,
                timeout=120
            )
            if response.status_code == 200:
                data = response.json()
                print(f"  -> Mila: {len(data['elements'])} elements")
                return data['elements']
            else:
                print(f"  -> Status {response.status_code}, retry karenge...")
        except Exception as ex:
            print(f"  -> Error: {ex}, retry karenge...")

        time.sleep(10)  # retry se pehle thoda ruko

    print(f"  -> Tile {tile_num} FAIL ho gaya, skip kar rahe hain")
    return []

# Main
tiles = make_grid(FULL_BBOX, rows=3, cols=3)
all_elements = []

for i, tile in enumerate(tiles, 1):
    elements = fetch_tile(tile, i, len(tiles))
    all_elements.extend(elements)
    time.sleep(5)  # agle tile se pehle server ko saans lene do

print("=" * 50)
print("TOTAL facilities mili (sab tiles milake):", len(all_elements))

with open("all_facilities.json", "w") as f:
    json.dump({"elements": all_elements}, f)

print("Saved: all_facilities.json")
