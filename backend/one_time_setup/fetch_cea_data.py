import requests
import pdfplumber
import pandas as pd
import re

PDF_URL = "https://cea.nic.in/wp-content/uploads/pdm/2025/09/List_of_Power_Station_as_on_31.03.2025.pdf"

print("PDF download ho raha hai...")
response = requests.get(PDF_URL, timeout=60)
with open("cea_power_stations.pdf", "wb") as f:
    f.write(response.content)
print("Saved: cea_power_stations.pdf")

rows = []
with pdfplumber.open("cea_power_stations.pdf") as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for page_num, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                if row and len(row) >= 7:
                    rows.append(row)
        if (page_num + 1) % 20 == 0:
            print(f"{page_num + 1} pages processed...")

print("Total raw rows extracted:", len(rows))

# DataFrame banao — columns approximately: S.No, Region, State, Sector, Org, Project Name, Prime Mover, Unit No, Capacity, Year
df = pd.DataFrame(rows)
df.to_csv("cea_raw_extracted.csv", index=False)
print("Saved: cea_raw_extracted.csv (raw, cleaning agla step mein)")