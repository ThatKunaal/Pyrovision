import pandas as pd

df = pd.read_csv("final_with_coal.csv")  # sabse latest, saare sources wali file

gas_flare_df = df[df['final_classification'] == 'Gas Flare']

print("Total Gas Flare points:", len(gas_flare_df))
print("Gas Flare with ANY known identity (OSM name OR CEA OR WRI OR Coal):",
      (gas_flare_df['has_facility'] | 
       gas_flare_df['cea_validated'].fillna(False) | 
       gas_flare_df['wri_verified'].fillna(False) | 
       gas_flare_df['coal_verified'].fillna(False)).sum())
print("Gas Flare with OFFICIAL govt-source validation (CEA/WRI/Coal, excluding plain OSM):",
      (gas_flare_df['cea_validated'].fillna(False) | 
       gas_flare_df['wri_verified'].fillna(False) | 
       gas_flare_df['coal_verified'].fillna(False)).sum())