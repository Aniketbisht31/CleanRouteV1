import httpx

async def get_routes(origin: str, destination: str, activity_mode: str = "driving") -> dict:
    """
    Fetch alternative routes between origin and destination from OSRM Directions API.
    activity_mode maps to specialized OSRM servers: walking/running -> routed-foot, cycling -> routed-bike, driving -> routed-car.
    """
    # Map activity_mode to OSRM server sub-path and profile
    mode_config = {
        "walking": {"server": "routed-foot", "profile": "foot"},
        "running": {"server": "routed-foot", "profile": "foot"},
        "cycling": {"server": "routed-bike", "profile": "bicycle"},
        "driving": {"server": "routed-car", "profile": "driving"}
    }
    
    config = mode_config.get(activity_mode, mode_config["driving"])
    server_path = config["server"]
    profile = config["profile"]

    # parse lat,lng strings to lon,lat for OSRM
    def parse_coords(coord_str):
        lat, lon = coord_str.split(',')
        return f"{lon.strip()},{lat.strip()}"
        
    orig_osrm = parse_coords(origin)
    dest_osrm = parse_coords(destination)

    # Use the more specialized OpenStreetMap.de routing servers for walking/cycling support
    url = f"https://routing.openstreetmap.de/{server_path}/route/v1/{profile}/{orig_osrm};{dest_osrm}"
    params = {
        "alternatives": "3", # request more alternative routes
        "geometries": "geojson",
        "overview": "full"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code != 200:
                print(f"OSRM API Error ({profile}):", response.text)
                return {"routes": []}
                
            return response.json()
    except Exception as e:
        print("OSRM Request Exception:", e)
        return {"routes": []}
