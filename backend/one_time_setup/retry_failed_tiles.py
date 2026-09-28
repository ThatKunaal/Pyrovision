import requests
import json
import time

headers = {"User-Agent": "PyrovisionApp/1.0"}

def fetch_tile(bbox, name, retries=5):
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
    for attempt in range(1, retries + 1):
        print(f"{name} — attempt {attempt}...")
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
                print(f"  -> Status {response.status_code}, thoda ruk ke retry...")
        except Exception as ex:
            print(f"  -> Error: {ex}, retry karenge...")
        time.sleep(15)  # pehle se zyada wait — server ko thanda hone do
    print(f"  -> {name} phir bhi fail, skip")
    return []

# Tile 9 = North-East India (r=2, c=2 wala tile)
tile9_bbox = (26.667, 87.333, 37, 97)
# Tile 3 = confirm karne ke liye (r=0, c=2)
tile3_bbox = (6, 87.333, 16.333, 97)

new_elements = []
new_elements += fetch_tile(tile9_bbox, "Tile 9 (North-East)")
time.sleep(10)
new_elements += fetch_tile(tile3_bbox, "Tile 3 (Bay of Bengal region)")

print("=" * 50)
print("Naye tiles se mile:", len(new_elements))

# Purani file load karo aur merge karo
with open("all_facilities.json", "r") as f:
    old_data = json.load(f)

old_elements = old_data['elements']

# Duplicate hatane ke liye (id + type ke basis pe)
seen = set((el['type'], el['id']) for el in old_elements)
merged = list(old_elements)

added = 0
for el in new_elements:
    key = (el['type'], el['id'])
    if key not in seen:
        merged.append(el)
        seen.add(key)
        added += 1

print("Naye unique elements jode:", added)
print("Final total:", len(merged))

with open("all_facilities.json", "w") as f:
    json.dump({"elements": merged}, f)

print("Updated all_facilities.json save ho gaya!")