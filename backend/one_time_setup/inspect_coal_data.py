import kagglehub

path = kagglehub.dataset_download("shitalgaikwad123/indian-coal-mines-dataset-january-20211")
print("Path to dataset files:", path)

import os
print("Files:", os.listdir(path))

import pandas as pd
for f in os.listdir(path):
    if f.endswith('.csv') or f.endswith('.xlsx'):
        df = pd.read_excel(os.path.join(path, f)) if f.endswith('.xlsx') else pd.read_csv(os.path.join(path, f))
        print(f"\n--- {f} ---")
        print("Columns:", df.columns.tolist())
        print(df.head())