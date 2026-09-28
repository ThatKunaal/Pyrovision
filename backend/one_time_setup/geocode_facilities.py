import requests
import pandas as pd
import time

# Tumhari original list se — exact naam use kiye (jahan // ke baad naam tha, woh use kiya)
FACILITY_NAMES = {
    # Steel Plants
    3305: "JSW Steel Plant",
    3411: "Hospet Steels",
    3419: "Vedanta Limited",
    3468: "JSW Ispat Steel Plant",
    3536: "ArcelorMittal Nippon Steel India",
    3542: "Bhilai Steel Plant",
    3555: "Jayaswal Neco",
    3559: "Godavari Power and Isspat Ltd",
    3558: "Sarda Energy Minerals Ltd",
    3552: "Bajrang Power Ispat",
    3603: "Prakash Industries Steel Plant",
    3607: "Singhal Steel And Power",
    3588: "IND SYNERGY LTD",
    3589: "MSP Steel and Power Ltd",
    3568: "Shyam Metallic Energy",
    3584: "SPS Steel And Power",
    3573: "Bhushan Power Steel",
    3490: "Tata Steel Meramandali",
    3500: "Angul Steel Plant",
    3521: "IEL Kalinganagar Tata Steel Power Station",
    3515: "Duburi Steel Power Plant",
    3639: "Rashmi Steels",
    3650: "Tata Steel Jamshedpur",
    3652: "Adityapur Works Power Station",
    3647: "Chaliyama Steel Plant Rungta",
    3477: "Indian Metals Ferro Alloys Limited",
    3462: "Mahaamaaya Industries",
    # Power Plants
    3670: "Durgapur SAIL Power Station",
    3684: "Bokaro Works Power Plant",
    3391: "Danapuram BMM Captive Power Plant",
    3537: "Hazira Power Plant",
    3654: "Coastal Gujarat Power Ltd",
    3661: "Kandla Power Pvt Ltd",
    3602: "Prakash Champa Captive Power Station",
    3593: "Raigarh Jindal Power Station",
    3594: "Rungta Kamanda Power Station",
    3453: "Sinter Thermal Power Plant",
    # Oil Refinery
    3472: "Hindustan Petroleum Refinery",
    3635: "Reliance Refinery",
    3800: "Guru Gobind Singh Refinery",
    3794: "IOCL Oil Refinery",
    3457: "Hindustan Petroleum Corporation Limited",
    3331: "Chennai Petroleum Corporation",
    # Mining
    3729: "Amlohri Coal Mines",
    3660: "Chirimiri Open Cast Coal Mines",
    3597: "BGR Mining And Infra",
    3512: "Lingaraj Opencast Mining Project",
    # TH-3745 (Pakistan) — EXCLUDED
}

def geocode(place_name):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": f"{place_name}, India", "format": "json", "limit": 1}
    headers = {"User-Agent": "PyrovisionApp/1.0"}
    try:
        r = requests.get(url, params=params, headers=headers, timeout=10)
        results = r.json()
        if results:
            return float(results[0]['lat']), float(results[0]['lon'])
    except Exception as e:
        print(f"  Error: {e}")
    return None, None

rows = []
for site_id, name in FACILITY_NAMES.items():
    lat, lon = geocode(name)
    status = "OK" if lat else "NOT FOUND"
    print(f"TH-{site_id} ({name}) -> {lat}, {lon} [{status}]")
    rows.append({"site_id": site_id, "name": name, "geocoded_lat": lat, "geocoded_lon": lon})
    time.sleep(1.2)

df = pd.DataFrame(rows)
df.to_csv("geocoded_facilities.csv", index=False)
found = df['geocoded_lat'].notna().sum()
print("=" * 50)
print(f"Total geocoded successfully: {found} / {len(df)}")
print("Saved: geocoded_facilities.csv")