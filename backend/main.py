from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from services.routing import get_routes
from services.scoring import calculate_pollution_score
from services.geocoding import geocode

# Find .env file in root
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="CleanRoute API")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    origin: str
    destination: str
    activity_mode: str = "driving"

@app.post("/routes")
async def find_routes(request: RouteRequest):
    # 1. Geocode origin and destination if needed
    origin_coords = await geocode(request.origin)
    dest_coords = await geocode(request.destination)
    
    if not origin_coords or not dest_coords:
        return {"error": "Could not resolve locations. Please try more specific addresses or coordinates.", "routes": []}

    # 2. Fetch routes from OSRM using selected activity mode
    routes_data = await get_routes(origin_coords, dest_coords, request.activity_mode)
    
    # Process routes, get AQI, calculate score
    processed_routes = []
    
    for idx, route in enumerate(routes_data.get("routes", [])):
        # Extract route details
        duration_seconds = route.get("duration", 0)
        duration_minutes = duration_seconds / 60.0
        
        # Calculate scores with intensity factors
        score = await calculate_pollution_score(route, duration_minutes, request.activity_mode)
        
        # Determine label (Fastest vs Cleanest vs Alternatives)
        # We can figure out labels after evaluating all scores
        processed_routes.append({
            "duration": duration_minutes,
            "pollution_score": score,
            "coordinates": route.get("geometry", {}).get("coordinates", []),
            "distance": route.get("distance", 0)
        })
        
    # Sort and label
    if not processed_routes:
        return {"routes": []}
        
    # Find fastest (usually index 0 from OSRM API)
    fastest_route = processed_routes[0]
    fastest_route["route_type"] = "fastest"
    
    # Find cleanest
    cleanest_route = min(processed_routes, key=lambda x: x["pollution_score"])
    
    final_routes = [fastest_route]
    
    # Always include a "cleanest" option in the response
    if cleanest_route == fastest_route:
        # Create a copy to avoid pointer issues, and label it cleanest
        cleanest_copy = fastest_route.copy()
        cleanest_copy["route_type"] = "cleanest"
        final_routes.append(cleanest_copy)
    else:
        cleanest_route["route_type"] = "cleanest"
        final_routes.append(cleanest_route)
        
    return {"routes": final_routes}
