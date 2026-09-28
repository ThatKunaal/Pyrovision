import pdfplumber
import pandas as pd
import re

FUEL_TYPES = "Steam|GT-Gas|Hydro|Nuclear|Diesel"

# Strict pattern — clean lines ke liye (state clearly separate)
STRICT_PATTERN = re.compile(
    rf"^(?:\d+)?\s*(NR|WR|SR|ER|NER)\s+(.+?)\s*(State Sector|Private Sector|Central Sector)\s+(.+?)\s+({FUEL_TYPES})\s+(\d+)\s+([\d.]+)\s+(\d{{4}})$"
)

# Loose fallback — corrupted lines ke liye (bas "Sector" tak raw rakho, state parse mat karo)
LOOSE_PATTERN = re.compile(
    rf"^(?:\d+)?\s*(NR|WR|SR|ER|NER)\s+(.+?Sector)\s+(.+?)\s+({FUEL_TYPES})\s+(\d+)\s+([\d.]+)\s+(\d{{4}})$"
)

rows = []
still_unmatched = []

with pdfplumber.open("cea_power_stations.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        if not text:
            continue
        for line in text.split("\n"):
            line = line.strip()
            if not line or not re.search(FUEL_TYPES, line):
                continue

            match = STRICT_PATTERN.match(line)
            if match:
                region, state, sector, name_blob, fuel, unit_no, capacity, year = match.groups()
                rows.append({"region": region, "state": state.strip(), "sector": sector,
                             "name_blob": name_blob.strip(), "fuel_type": fuel,
                             "capacity_mw": float(capacity), "confidence": "high"})
                continue

            match2 = LOOSE_PATTERN.match(line)
            if match2:
                region, state_raw, name_blob, fuel, unit_no, capacity, year = match2.groups()
                rows.append({"region": region, "state": state_raw.strip(), "sector": "Unknown",
                             "name_blob": name_blob.strip(), "fuel_type": fuel,
                             "capacity_mw": float(capacity), "confidence": "low"})
                continue

            still_unmatched.append(line)

df = pd.DataFrame(rows)
print("Total matched rows:", len(df))
print("  High-confidence (clean):", (df['confidence'] == 'high').sum())
print("  Low-confidence (state field messy):", (df['confidence'] == 'low').sum())
print("Still fully unmatched:", len(still_unmatched))

# Project-level aggregate
projects = df.groupby(['name_blob'], as_index=False).agg(
    state=('state', 'first'),
    total_capacity_mw=('capacity_mw', 'sum'),
    fuel_type=('fuel_type', lambda x: x.mode()[0] if not x.mode().empty else x.iloc[0]),
    confidence=('confidence', 'first')
)

print("Total unique power projects:", len(projects))
projects.to_csv("cea_projects_clean.csv", index=False)
print("Saved: cea_projects_clean.csv")

if still_unmatched:
    print("=" * 50)
    print("Pehli 5 truly-unmatched lines:")
    for l in still_unmatched[:5]:
        print(repr(l))