import pandas as pd

df = pd.read_csv("final_with_wri.csv")

# Sirf woh sites jinke paas koi facility hai
has_fac = df[df['has_facility'] == True].copy()
print("Total sites with ANY facility:", len(has_fac))

# Distance distribution dekho (agar threshold badhayen to kitna fayda hoga)
print("=" * 50)
print("WRI distance distribution (sirf has_facility=True sites ke liye):")
print(has_fac['wri_distance_km'].describe())

print("=" * 50)
for t in [2, 3, 5, 10, 15, 20]:
    count = (has_fac['wri_distance_km'] <= t).sum()
    print(f"Within {t}km: {count} sites")

# Kitne facility-names mein "power"/"plant"/"tps"/etc jaisa power-related keyword hai
print("=" * 50)
power_keywords = ['power', 'plant', 'tps', 'ccpp', 'stpp', 'gps', 'hps', 'thermal', 'energy']
has_fac['looks_like_power'] = has_fac['facility_name'].fillna('').str.lower().apply(
    lambda x: any(kw in x for kw in power_keywords)
)
print("Facility names that LOOK like power-plants:", has_fac['looks_like_power'].sum())
print("Facility names that DON'T look like power-plants (steel/cement/mines/etc):", (~has_fac['looks_like_power']).sum())