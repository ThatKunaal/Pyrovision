import pandas as pd
from rapidfuzz import fuzz, process

sites_df = pd.read_csv("final_hybrid_classification.csv")
cea_matched_df = pd.read_csv("cea_osm_matched.csv")

cea_names = cea_matched_df['osm_name'].tolist()

def find_cea_match(facility_name):
    if pd.isna(facility_name) or facility_name in ['Not Checked', 'Unnamed Facility']:
        return None, None, None
    result = process.extractOne(facility_name, cea_names, scorer=fuzz.token_set_ratio)
    if result and result[1] >= 70:
        matched_name, score, idx = result
        cea_row = cea_matched_df.iloc[idx]
        return cea_row['cea_capacity_mw'], cea_row['cea_fuel_type'], True
    return None, None, False

results = sites_df['facility_name'].apply(find_cea_match)
sites_df['cea_capacity_mw'] = [r[0] for r in results]
sites_df['cea_fuel_type'] = [r[1] for r in results]
sites_df['cea_validated'] = [r[2] for r in results]

validated_count = sites_df['cea_validated'].sum()
print(f"Total sites CEA-validated: {validated_count} / {len(sites_df)}")
print(sites_df[sites_df['cea_validated'] == True][['facility_name', 'cea_capacity_mw', 'cea_fuel_type']].head(15))

sites_df.to_csv("final_with_cea.csv", index=False)
print("Saved: final_with_cea.csv")