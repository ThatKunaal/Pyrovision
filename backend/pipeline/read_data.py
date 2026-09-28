import pandas as pd
from archive.osm_check import check_nearby_facility
import time

# ============================================
# STEP 1: Raw data padho
# ============================================
df = pd.read_csv("raw_data.csv")

print("Total kitne hotspots mile:", len(df))
print(df.head())
print("===================================================")

# ============================================
# STEP 2: Sirf India ka data filter karo
# ============================================
india_df = df[
    (df['latitude'] >= 8) & (df['latitude'] <= 37) &
    (df['longitude'] >= 68) & (df['longitude'] <= 97)
]

print("Sirf India ke hotspots:", len(india_df))
print(india_df.head())
print("===================================================")

# Filtered India data ko nayi file mein save karo
india_df.to_csv("india_data.csv", index=False)
print("India ka data save ho gaya india_data.csv mein!")

# ============================================
# STEP 3: Coordinates round karo, grouping karo
# ============================================
india_df = india_df.copy()  # warning avoid karne ke liye
india_df['lat_rounded'] = india_df['latitude'].round(2)
india_df['long_rounded'] = india_df['longitude'].round(2)

grouped = india_df.groupby(['lat_rounded', 'long_rounded']).size().reset_index(name='count')

print("Kitni alag-alag 'sites' mili:", len(grouped))
print(grouped.head(10))
print("===================================================")

# ============================================
# STEP 4: days_active aur total_detections nikaalo
# ============================================
grouped_days = india_df.groupby(['lat_rounded', 'long_rounded']).agg(
    days_active=('acq_date', 'nunique'),
    total_detections=('acq_date', 'count')
).reset_index()

print("Har site ka days_active (top 15):")
print(grouped_days.sort_values('days_active', ascending=False).head(15))
print("===================================================")

# ============================================
# STEP 5: Sirf "interesting" sites (days_active >= 3) OSM check karo
# ============================================
interesting_sites = grouped_days[grouped_days['days_active'] >= 3].copy()
print(f"Total sites: {len(grouped_days)}, Interesting sites (days_active >= 3): {len(interesting_sites)}")
print("===================================================")

facility_results = []

for index, row in interesting_sites.iterrows():
    lat = row['lat_rounded']
    lon = row['long_rounded']
    
    has_facility, facility_name = check_nearby_facility(lat, lon, radius=3000)
    facility_results.append({
        'lat_rounded': lat,
        'long_rounded': lon,
        'has_facility': has_facility,
        'facility_name': facility_name
    })
    
    print(f"Site check ho gaya - Facility: {has_facility}")
    time.sleep(3)

facility_df = pd.DataFrame(facility_results)
print("===================================================")

# ============================================
# STEP 6: Facility data ko grouped_days ke saath jodo
# ============================================
grouped_days = grouped_days.merge(
    facility_df,
    on=['lat_rounded', 'long_rounded'],
    how='left'
)

print("Final data (facility info ke saath):")
print(grouped_days.sort_values('days_active', ascending=False).head(15))
print("===================================================")

# ============================================
# STEP 7: Final data save karo
# ============================================
grouped_days.to_csv("sites_data.csv", index=False)
print("Processed sites data save ho gaya sites_data.csv mein!")