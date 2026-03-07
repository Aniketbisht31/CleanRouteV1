"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Route {
    route_type: string;
    duration: number;
    pollution_score: number;
    coordinates: [number, number][]; // [lon, lat] from GeoJSON
    distance?: number;
}

interface MapComponentProps {
    routes: Route[];
}

// Component to handle map bounds when routes change
function MapBoundsUpdater({ routes }: { routes: Route[] }) {
    const map = useMap();

    useEffect(() => {
        if (routes.length > 0 && routes[0].coordinates.length > 0) {
            const bounds = L.latLngBounds([]);

            routes.forEach(route => {
                route.coordinates.forEach(coord => {
                    // GeoJSON is [lon, lat], Leaflet wants [lat, lon]
                    bounds.extend([coord[1], coord[0]]);
                });
            });

            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [60, 60], duration: 1 });
            }
        }
    }, [routes, map]);

    return null;
}

export default function MapComponent({ routes }: MapComponentProps) {
    // Fix for Leaflet marker icons not showing in Next.js
    useEffect(() => {
        // Safe check for window
        if (typeof window !== 'undefined') {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            });
        }
    }, []);

    return (
        <div className="w-full h-full rounded-2xl shadow-2xl overflow-hidden border border-gray-800 relative z-0">
            <MapContainer
                center={[40.7128, -74.006]}
                zoom={12}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {routes.map((route, index) => {
                    // Determine color based on type
                    let color = '#3b82f6'; // default blue
                    if (route.route_type === 'cleanest') {
                        color = '#22c55e'; // vibrant green
                    } else if (route.route_type === 'fastest') {
                        color = '#ef4444'; // red
                    }

                    // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
                    const positions: LatLngTuple[] = route.coordinates.map(c => [c[1], c[0]]);

                    return (
                        <React.Fragment key={`route-${index}`}>
                            {/* Glow effect (wider, transparent polyline) */}
                            <Polyline
                                positions={positions}
                                pathOptions={{ color: color, weight: 12, opacity: 0.2, lineCap: 'round', lineJoin: 'round' }}
                            />
                            {/* Main polyline */}
                            <Polyline
                                positions={positions}
                                pathOptions={{ color: color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                            />
                        </React.Fragment>
                    );
                })}
                <MapBoundsUpdater routes={routes} />
            </MapContainer>
        </div>
    );
}
