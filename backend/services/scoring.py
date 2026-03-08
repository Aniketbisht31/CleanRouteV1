from .aqidata import get_avg_pm25

async def calculate_pollution_score(route: dict, duration_minutes: float, activity_type: str = "driving") -> float:
    """
    Calculate the pollution exposure score.
    Formula: average_PM25 * route_duration_minutes * traffic_factor * intensity_factor
    """
    coords = route.get("geometry", {}).get("coordinates", [])
    
    # 1. Get Average PM2.5 for this route
    avg_pm25 = await get_avg_pm25(coords)
    
    # 2. Activity Intensity Factor (Humans inhale more air during activity)
    intensity_map = {
        "driving": 1.0,
        "walking": 1.5,
        "cycling": 2.5,
        "running": 4.0
    }
    intensity_factor = intensity_map.get(activity_type, 1.0)

    # 3. Traffic Factor (Higher for driving/commuting near roads)
    traffic_factor = 1.1 if activity_type == "driving" else 1.0

    # 4. Calculate Score
    pollution_score = avg_pm25 * duration_minutes * traffic_factor * intensity_factor
    
    return pollution_score
