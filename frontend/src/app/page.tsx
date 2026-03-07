"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Route } from "@/components/MapComponent";

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityMode, setActivityMode] = useState<"walking" | "running" | "cycling" | "driving">("driving");

  const fetchRoutes = async () => {
    if (!origin || !destination) {
      setError("Please enter both origin and destination.");
      return;
    }

    setLoading(true);
    setError(null);
    setRoutes([]); // clear previous

    try {
      const response = await fetch(`${API_URL}/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, activity_mode: activityMode }),
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to fetch routes");
      }

      const data = await response.json();

      if (data.routes && Array.isArray(data.routes)) {
        setRoutes(data.routes);
      } else {
        setRoutes([]);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const cleanestRoute = routes.find(r => r.route_type === "cleanest");
  const fastestRoute = routes.find(r => r.route_type === "fastest");

  // High pollution alert based on fastest route exposure (example logic)
  const highPollutionAlert = fastestRoute && fastestRoute.pollution_score > 50;

  return (
    <main className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 font-sans overflow-hidden">
      {/* Sidebar Panel for Inputs and Results */}
      <div className="z-10 w-full md:w-[400px] h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-all duration-300">

        {/* Header Section */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-emerald-500">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            CleanRoute
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Find the healthiest path to your destination by avoiding heavily polluted areas.
          </p>
        </div>

        {/* Scrollable Content Section */}
        <div className="p-6 flex flex-col gap-4 flex-grow overflow-y-auto">
          <div className="space-y-4 shrink-0">
            {/* Origin Input */}
            <div className="space-y-1.5">
              <label htmlFor="origin" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Origin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-zinc-900 shadow-sm"></div>
                </div>
                <input
                  type="text"
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Times Square, NY"
                  onKeyDown={(e) => e.key === 'Enter' && fetchRoutes()}
                />
              </div>
            </div>

            {/* Destination Input */}
            <div className="space-y-1.5">
              <label htmlFor="destination" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Destination
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-zinc-900 shadow-sm"></div>
                </div>
                <input
                  type="text"
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Central Park, NY"
                  onKeyDown={(e) => e.key === 'Enter' && fetchRoutes()}
                />
              </div>
            </div>

            {/* Activity Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Activity Mode
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "walking", icon: "🚶", label: "Walk" },
                  { id: "running", icon: "🏃", label: "Run" },
                  { id: "cycling", icon: "🚲", label: "Bike" },
                  { id: "driving", icon: "🚗", label: "Drive" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setActivityMode(mode.id as any)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${activityMode === mode.id
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                  >
                    <span className="text-xl">{mode.icon}</span>
                    <span className="text-[10px] font-medium mt-1 uppercase tracking-tighter">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={fetchRoutes}
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </span>
              ) : (
                <>
                  <span>Find CleanRoute</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 mt-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Alert Section */}
          {highPollutionAlert && (
            <div className="p-4 mt-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 shadow-sm">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300">High Pollution Warning</h4>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">The fastest route has elevated PM2.5 levels. Consider taking the Cleanest Route to reduce exposure.</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {routes.length > 0 && (
            <div className="mt-4 pb-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Route Options
              </h3>
              <div className="space-y-3">
                {/* Cleanest Route Card */}
                {cleanestRoute && (
                  <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">Cleanest</span>
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-emerald-400">{Math.ceil(cleanestRoute.duration)} min</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Distance: {cleanestRoute.distance ? (cleanestRoute.distance / 1609.34).toFixed(1) : "?"} mi</p>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">AQI Exposure Rating</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {cleanestRoute.pollution_score ? cleanestRoute.pollution_score.toFixed(1) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fastest Route Card */}
                {fastestRoute && (
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-90 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">Fastest</span>
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-amber-400">{Math.ceil(fastestRoute.duration)} min</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Distance: {fastestRoute.distance ? (fastestRoute.distance / 1609.34).toFixed(1) : "?"} mi</p>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">AQI Exposure Rating</p>
                        <p className={`text-lg font-bold ${fastestRoute.pollution_score > 50 ? 'text-rose-500 dark:text-rose-400' : 'text-amber-500 dark:text-amber-400'}`}>
                          {fastestRoute.pollution_score ? fastestRoute.pollution_score.toFixed(1) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-zinc-200 dark:bg-zinc-800 z-0">
        <MapComponent routes={routes} />
      </div>
    </main>
  );
}
