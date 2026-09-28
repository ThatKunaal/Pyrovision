import pandas as pd

df = pd.read_csv("cea_raw_extracted.csv", header=None,
                  names=['s_no', 'region', 'state', 'sector', 'org', 'project_name',
                         'prime_mover', 'unit_no', 'capacity_mw', 'year'])

# Header-repeat rows hatao (jo baar-baar "S.No. Region State..." bantі hain page-breaks pe)
df = df[df['state'] != 'State']
df = df[df['project_name'] != 'Name of Project']

# Capacity ko number banao (kabhi kabhi text/garbage aa sakta hai)
df['capacity_mw'] = pd.to_numeric(df['capacity_mw'], errors='coerce')

# Sirf zaroori rows rakho jinme project_name aur capacity dono hain
df = df.dropna(subset=['project_name', 'capacity_mw'])

# Project-level aggregate: naam + state ke basis pe group karo, saari units ka capacity jodo
projects = df.groupby(['project_name', 'state'], as_index=False).agg(
    total_capacity_mw=('capacity_mw', 'sum'),
    fuel_type=('prime_mover', lambda x: x.mode()[0] if not x.mode().empty else x.iloc[0]),
    organisation=('org', 'first'),
    region=('region', 'first')
)

print("Total unique power projects:", len(projects))
print(projects.head(15))

projects.to_csv("cea_projects_clean.csv", index=False)
print("Saved: cea_projects_clean.csv")