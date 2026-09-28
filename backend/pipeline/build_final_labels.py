import pandas as pd

df = pd.read_csv("sites_data_with_landcover.csv")

def assign_label_v2(row):
    if row['has_facility']:
        return "Gas Flare"
    elif row['total_detections'] >= 5:
        return "Uncertain"
    elif row['land_cover_class'] == 'Cropland':
        return "Crop Residue Burning"
    else:
        return "Wildfire"

df['weak_label_v2'] = df.apply(assign_label_v2, axis=1)

print(df['weak_label_v2'].value_counts())
print("=" * 50)

df_clean = df[df['weak_label_v2'] != 'Uncertain'].copy()
print("Training ke liye usable sites:", len(df_clean))
print(df_clean['weak_label_v2'].value_counts())

df_clean.to_csv("labeled_sites_v2.csv", index=False)
print("Saved: labeled_sites_v2.csv")