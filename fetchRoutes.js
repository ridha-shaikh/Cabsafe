import fs from 'fs';
import http from 'http';

const routes = [
  {
    routeId: 'CHE-RT-01',
    name: 'Chennai Airport to Tidel Park',
    coords: [[80.1636, 12.9815], [80.2014, 13.0039], [80.2483, 12.9897]]
  },
  {
    routeId: 'CHE-RT-02',
    name: 'Chennai Central to Marina Beach',
    coords: [[80.2757, 13.0827], [80.2730, 13.0694], [80.2818, 13.0405]]
  },
  {
    routeId: 'CHE-RT-03',
    name: 'Koyambedu to Sholinganallur',
    coords: [[80.2052, 13.0669], [80.2045, 13.0177], [80.2279, 12.9009]]
  },
  {
    routeId: 'CHE-RT-04',
    name: 'Anna Nagar to Besant Nagar',
    coords: [[80.2116, 13.0844], [80.2415, 13.0601], [80.2713, 12.9995]]
  },
  {
    routeId: 'CHE-RT-05',
    name: 'Guindy to Tambaram',
    coords: [[80.2036, 13.0118], [80.1491, 12.9675], [80.1133, 12.9238]]
  }
];

async function fetchRoute(route) {
  const coordString = route.coords.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `http://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
  
  return new Promise((resolve, reject) => {
    http.get(url, { headers: { 'User-Agent': 'CabSafe-Demo/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.routes && json.routes.length > 0) {
            const coords = json.routes[0].geometry.coordinates;
            // Map [lng, lat] to {lat, lng}
            const waypointsJson = coords.map(c => ({ lat: c[1], lng: c[0] }));
            resolve({
              routeId: route.routeId,
              name: route.name,
              distanceKm: json.routes[0].distance / 1000,
              estimatedDurationMin: Math.round(json.routes[0].duration / 60),
              waypointsJson
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const results = [];
  for (const r of routes) {
    console.log(`Fetching route: ${r.name}...`);
    const data = await fetchRoute(r);
    if (data) {
      results.push(data);
    }
    // Rate limit precaution
    await new Promise(res => setTimeout(res, 1000));
  }
  
  const fileContent = `import { Route } from '../types/entities';\n\nexport const CHENNAI_ROUTES: Route[] = ${JSON.stringify(results, null, 2)};\n`;
  fs.writeFileSync('./src/data/chennaiRoutes.ts', fileContent);
  console.log('Routes generated successfully!');
}

main();
