import os
import httpx
from typing import List, Tuple

async def get_avg_pm25(coordinates: List[List[float]]) -> float:
    """
    Fetch PM2.5 data for given coordinates using OpenWeatherMap API.
    Since querying every coordinate is expensive, we sample a few points (e.g., start, middle, end).
    Coordinates from Mapbox are in [longitude, latitude] format.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key or api_key == "your_openweather_token_here":
        # Fallback for prototype testing if API key is not set
        return 15.0

    # Sample up to 7 points along the route for better granularity
    num_coords = len(coordinates)
    if num_coords <= 7:
        samples = coordinates
    else:
        # Pick 7 equidistant indices
        indices = [int(i * (num_coords - 1) / 6) for i in range(7)]
        samples = [coordinates[i] for i in indices]

    total_pm25 = 0
    valid_samples = 0

    async with httpx.AsyncClient() as client:
        for lon, lat in samples:
            url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"
            try:
                response = await client.get(url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    pm25 = data["list"][0]["components"]["pm2_5"]
                    total_pm25 += pm25
                    valid_samples += 1
            except Exception as e:
                print(f"Error fetching AQI for {lat},{lon}: {e}")

    if valid_samples == 0:
        return 15.0 # default fallback

    return total_pm25 / valid_samples
