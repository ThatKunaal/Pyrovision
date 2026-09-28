import requests

api_key = "3d16490f46abdb129c1fdbfa5261fb6a"
url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/3d16490f46abdb129c1fdbfa5261fb6a/VIIRS_SNPP_NRT/68,6,98,37/5"

response = requests.get(url)

# Data ko ek file mein save karo
with open("raw_data.csv", "w") as f:
    f.write(response.text)

print("05 din ka data save ho gaya raw_data.csv mein!")