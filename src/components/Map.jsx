import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Route colors
const ROUTE_COLORS = {
  1: '#1a73e8',
  2: '#34a853',
  3: '#ea4335'
};

// Custom icons
const originIcon = L.divIcon({
  className: '',
  html: '<div class="origin-dot"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const destIcon = L.divIcon({
  className: '',
  html: `<div class="dest-pin">
    <svg viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z" fill="#ea4335"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  </div>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36]
});

const gpsIcon = L.divIcon({
  className: '',
  html: '<div class="gps-dot"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Map bounds fitter
function MapUpdater({ routes, source, destination }) {
  const map = useMap();
  
  useEffect(() => {
    if (Array.isArray(routes) && routes.length > 0) {
      try {
        const allCoords = routes.flatMap(r => (Array.isArray(r.coords) ? r.coords : []));
        if (allCoords.length > 0) {
          const bounds = L.latLngBounds(allCoords);
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [routes, map]);
  
  return null;
}

export default function Map({ 
  routes = [], 
  source, 
  destination, 
  selectedRouteId,
  onRouteClick,
  gpsPosition
}) {
  const [mapStyle, setMapStyle] = useState('voyager');

  const tileConfigs = {
    voyager: {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: 'Map data ©2024 Google',
      maxZoom: 20
    },
    satellite: {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: 'Map data ©2024 Google',
      maxZoom: 20
    }
  };

  const currentTile = tileConfigs[mapStyle];

  return (
    <div className="flex-1 relative overflow-hidden min-w-0">
      <MapContainer
        center={[22.5, 78.9]}
        zoom={5}
        zoomControl={false}
        attributionControl={false}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
      >
        <TileLayer
          url={currentTile.url}
          maxZoom={currentTile.maxZoom}
          attribution={currentTile.attribution}
        />
        
        <MapUpdater routes={routes} source={source} destination={destination} />

        {/* Routes */}
        {Array.isArray(routes) && routes.map((route) => {
          if (!route || !Array.isArray(route.coords)) return null;
          
          const isActive = route.id === selectedRouteId;
          const routeColor = ROUTE_COLORS[route.id] || ROUTE_COLORS[1];
          
          return (
            <Polyline
              key={route.id}
              positions={route.coords}
              pathOptions={{
                color: routeColor,
                weight: isActive ? 7 : 5,
                opacity: isActive ? 1 : 0.7,
                lineJoin: 'round',
                lineCap: 'round'
              }}
              eventHandlers={{
                click: () => onRouteClick && onRouteClick(route.id)
              }}
            />
          );
        })}

        {/* Markers */}
        {source && <Marker position={source} icon={originIcon} />}
        {destination && <Marker position={destination} icon={destIcon} />}
        {gpsPosition && <Marker position={gpsPosition} icon={gpsIcon} zIndexOffset={1000} />}
      </MapContainer>

      {/* Attribution */}
      <div className="absolute bottom-0 left-0 right-0 h-6.5 bg-white/90 border-t border-gray-300 flex items-center px-3 gap-2.5 text-[10.5px] text-gray-600 z-[800]">
        <span>Map data ©2024 Google</span>
        <button 
          onClick={() => setMapStyle(mapStyle === 'voyager' ? 'satellite' : 'voyager')}
          className="ml-auto text-blue-600 hover:underline cursor-pointer bg-transparent border-none text-[10.5px]"
        >
          {mapStyle === 'voyager' ? 'Satellite' : 'Map'}
        </button>
      </div>
    </div>
  );
}
