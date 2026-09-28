import requests
import time

def check_nearby_facility(lat, lon, radius=2000):
    query = f"""
    [out:json];
    (
      node["landuse"="industrial"](around:{radius},{lat},{lon});
      way["landuse"="industrial"](around:{radius},{lat},{lon});
      node["power"="plant"](around:{radius},{lat},{lon});
    );
    out;
    """
    
    headers = {"User-Agent": "PyrovisionApp/1.0"}
    
    try:
        response = requests.post(
            "https://overpass-api.de/api/interpreter",
            data={"data": query},
            headers=headers,
            timeout=15
        )
        
        if response.status_code != 200:
            print(f"Warning: Status {response.status_code} mila, skip kar rahe hain")
            return False, None
        
        data = response.json()
        
        if len(data['elements']) > 0:
            facility_name = data['elements'][0].get('tags', {}).get('name', 'Unnamed Facility')
            return True, facility_name
        else:
            return False, None
            
    except Exception as e:
        print(f"Error aaya: {e}, skip kar rahe hain")
        return False, None


# Test karne ke liye
if __name__ == "__main__":
    has_facility, name = check_nearby_facility(28.6139, 77.2090)
    print("Facility mila:", has_facility)
    print("Naam:", name)