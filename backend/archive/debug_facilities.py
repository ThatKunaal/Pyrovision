import requests

query = """
[out:json][timeout:180];
area["ISO3166-1"="IN"][admin_level=2]->.india;
(
  node["landuse"="industrial"](area.india);
  way["landuse"="industrial"](area.india);
);
out count;
"""

response = requests.post(
    "https://overpass-api.de/api/interpreter",
    data={"data": query},
    headers={"User-Agent": "PyrovisionApp/1.0"},
    timeout=180
)
print(response.text)