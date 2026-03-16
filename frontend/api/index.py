from http.server import BaseHTTPRequestHandler
import json
import os

# Import your backend services
import sys
sys.path.append('../../backend')

# You'll need to install these packages in vercel.json
try:
    from services.routing import get_routes
    from services.scoring import calculate_pollution_score
    from services.geocoding import geocode
except ImportError:
    # Fallback for deployment
    def get_routes(*args, **kwargs):
        return {"routes": []}
    def calculate_pollution_score(*args, **kwargs):
        return 0
    def geocode(*args, **kwargs):
        return None

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            # Your existing backend logic
            origin_coords = geocode(data.get('origin', ''))
            dest_coords = geocode(data.get('destination', ''))
            
            if not origin_coords or not dest_coords:
                response = {"error": "Could not resolve locations", "routes": []}
            else:
                routes_data = get_routes(origin_coords, dest_coords, data.get('activity_mode', 'driving'))
                processed_routes = []
                
                for idx, route in enumerate(routes_data.get("routes", [])):
                    duration_seconds = route.get("duration", 0)
                    duration_minutes = duration_seconds / 60.0
                    
                    # Calculate pollution score
                    pollution_score = calculate_pollution_score(route.get("geometry", ""))
                    
                    processed_routes.append({
                        "id": f"route_{idx}",
                        "name": f"Route {idx + 1}",
                        "pollution_score": pollution_score,
                        "duration": duration_minutes,
                        "distance": route.get("distance", 0),
                        "geometry": route.get("geometry", "")
                    })
                
                response = {"routes": processed_routes}
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
