import json
import pandas as pd
from rapidfuzz import fuzz, process

cea_df = pd.read_csv("cea_projects_clean.csv")

with open("all_facilities.json") as f:
    osm_data = json.load(f)

# Sirf woh facilities rakho jo power-plant se related tags rakhti hain
osm_facilities = []
for el in osm_data['elements']:
    tags = el.get('tags', {})
    name = tags.get('name')
    if not name:
        continue

    is_power_related = (
        tags.get('power') == 'plant' or
        'power' in name.lower() or
        'thermal' in name.lower() or
        'tps' in name.lower() or
        'hps' in name.lower() or
        'ccpp' in name.lower() or
        'stpp' in name.lower()
    )
    if not is_power_related:
        continue

    if el['type'] == 'node':
        lat, lon = el.get('lat'), el.get('lon')
    else:
        center = el.get('center', {})
        lat, lon = center.get('lat'), center.get('lon')
    if lat is None or lon is None:
        continue

    osm_facilities.append({'name': name, 'lat': lat, 'lon': lon})

osm_df = pd.DataFrame(osm_facilities)
osm_names = osm_df['name'].tolist()

print("CEA projects:", len(cea_df))
print("OSM power-related facilities (filtered pool):", len(osm_df))

# Naam se common suffixes/org-codes hatao taaki core naam better match ho
SUFFIXES_TO_STRIP = ['TPS', 'HPS', 'STPP', 'CCPP', 'GPS', 'TPP', 'CCGT', 'EXT', 'GT']

def clean_name(name):
    words = name.upper().split()
    words = [w for w in words if w not in SUFFIXES_TO_STRIP]
    return ' '.join(words)

cea_df['clean_name'] = cea_df['name_blob'].apply(clean_name)
osm_clean_names = [clean_name(n) for n in osm_names]

THRESHOLD = 60  # token_set_ratio zyada lenient hota hai, isliye threshold thoda kam rakha

matches = []
for idx, row in cea_df.iterrows():
    result = process.extractOne(row['clean_name'], osm_clean_names, scorer=fuzz.token_set_ratio)
    if result and result[1] >= THRESHOLD:
        matched_clean, score, match_idx = result
        osm_row = osm_df.iloc[match_idx]
        matches.append({
            'cea_name': row['name_blob'],
            'osm_name': osm_row['name'],
            'match_score': score,
            'lat': osm_row['lat'],
            'lon': osm_row['lon'],
            'cea_capacity_mw': row['total_capacity_mw'],
            'cea_fuel_type': row['fuel_type'],
            'cea_state': row['state']
        })

matched_df = pd.DataFrame(matches)
print("=" * 50)
print("Total CEA projects matched to OSM:", len(matched_df))
print(matched_df.sort_values('match_score', ascending=False).head(20))

matched_df.to_csv("cea_osm_matched.csv", index=False)
print("Saved: cea_osm_matched.csv")