import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { origin, destination, activity_mode = 'driving' } = req.body;

    // For now, return a mock response
    // In a real deployment, you would call your actual backend API here
    const mockResponse = {
      routes: [
        {
          id: 'route_1',
          name: 'Cleanest Route',
          pollution_score: 25,
          duration: 30,
          distance: 5000,
          geometry: 'mock_geometry'
        },
        {
          id: 'route_2', 
          name: 'Fastest Route',
          pollution_score: 45,
          duration: 25,
          distance: 4500,
          geometry: 'mock_geometry_2'
        }
      ]
    };

    res.status(200).json(mockResponse);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
