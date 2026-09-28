import requests

lat = 28.6139
lon = 77.2090

query = f"""
[out:json];
(
  node["landuse"="industrial"](around:5000,{lat},{lon});
  way["landuse"="industrial"](around:5000,{lat},{lon});
  node["power"="plant"](around:5000,{lat},{lon});
);
out;
"""

headers = {
    "User-Agent": "PyrovisionApp/1.0"
}

response = requests.post(
    "https://overpass-api.de/api/interpreter", 
    data={"data": query},
    headers=headers
)

print("Status Code:", response.status_code)
data = response.json()
print("Kitne places mile:", len(data['elements']))

for el in data['elements'][:5]:
    print(el.get('tags', {}))