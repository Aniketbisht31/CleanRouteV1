import httpx

async def geocode(query: str) -> str:
    """
    Convert an address query into 'lat,lon' string using Nominatim.
    Returns: 'lat,lon' or None if not found.
    """
    if not query:
        return None
        
    # Check if it's already coordinates 'lat,lon'
    if ',' in query:
        parts = query.split(',')
        if len(parts) == 2:
            try:
                float(parts[0])
                float(parts[1])
                return query.strip()
            except ValueError:
                pass

    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "CleanRouteMVP/1.0"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data:
                    lat = data[0].get("lat")
                    lon = data[0].get("lon")
                    return f"{lat},{lon}"
    except Exception as e:
        print(f"Geocoding Error for '{query}': {e}")
        
    return None
