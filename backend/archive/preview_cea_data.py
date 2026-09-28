import pandas as pd

df = pd.read_csv("cea_raw_extracted.csv")
print("Shape:", df.shape)
print("=" * 50)
print("Pehli 10 rows:")
print(df.head(10).to_string())
print("=" * 50)
print("Column count check:")
print(df.count())