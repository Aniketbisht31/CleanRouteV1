# CleanRoute

CleanRoute is a pollution-aware navigation system that recommends cleaner travel routes instead of only the fastest option. It uses real-time map data from Mapbox and pollution data from OpenAQ/OpenWeather to calculate a "pollution score" for different route alternatives.

## Tech Stack
- **Frontend:** Next.js (App Router), React, TailwindCSS, Mapbox GL JS
- **Backend:** Python FastAPI, Uvicorn, HTTPX

## Prerequisites
- Node.js (v18+)
- Python (3.9+)

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory (`cleanroutev1/`) with the following keys:
```env
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be running at `http://localhost:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM packages:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

## Features
- **Modern UI:** Glassmorphism design with a dark and light mode feel.
- **Pollution Awareness:** Selects alternative routes that offer lower PM2.5 exposure.
- **Visual Feedback:** Routes are color-coded (Green for Cleanest, Red/Yellow/Blue for others).

## Notes
- `mapbox-gl` is required for rendering the map on the frontend.
- When searching, make sure you enter valid addresses recognized by the Mapbox Geocoding API.
