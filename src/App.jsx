import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import LeftStrip from './components/LeftStrip';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import AskMapsChat from './components/AskMapsChat';
import { geocode, fetchOSRM, fetchWeather, fetchAQI } from './services/api';
import { fmtDist, fmtTime, calcScore, toMins, haversine } from './utils/helpers';
import { MODE_FACTOR, ICONS, ROUTE_NAMES, ROUTE_DESCRIPTIONS } from './utils/constants';

function App() {
  // Ask Maps chatbot state
  const [askMapsOpen, setAskMapsOpen] = useState(false);

  // Input state
  const [source, setSource] = useState('Rajpura, Punjab');
  const [destination, setDestination] = useState('Patiala, Punjab');
  const [transportMode, setTransportMode] = useState('car');
  
  // Route state
  const [routes, setRoutes] = useState([]);
  const [routeTimes, setRouteTimes] = useState({});
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Map markers
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  
  // Navigation state
  const [navigating, setNavigating] = useState(false);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [navDistance, setNavDistance] = useState('-- km');
  const [navEta, setNavEta] = useState('Calculating ETA…');
  const [navRouteName, setNavRouteName] = useState('');
  const [navProgress, setNavProgress] = useState(100);
  const [watchId, setWatchId] = useState(null);
  const [simTimer, setSimTimer] = useState(null);
  const [simIdx, setSimIdx] = useState(0);

  // Swap source and destination
  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  // Get routes
  const handleGetRoutes = async () => {
    if (!source.trim() || !destination.trim()) return;

    setIsLoading(true);
    setRoutes([]);
    setSelectedRouteId(null);
    stopNavigation();

    try {
      // Geocode locations
      const [src, dest] = await Promise.all([
        geocode(source),
        geocode(destination)
      ]);
      
      setSourceCoords(src);
      setDestCoords(dest);

      // Fetch routes and weather data
      const [rawRoutes, srcWx, dstWx, srcAQ, dstAQ] = await Promise.all([
        fetchOSRM(src, dest),
        fetchWeather(src[0], src[1]),
        fetchWeather(dest[0], dest[1]),
        fetchAQI(src[0], src[1]),
        fetchAQI(dest[0], dest[1])
      ]);

      // Calculate midpoint weather (average)
      const avg = (a, b) => Math.round((a + b) / 2);
      const midWx = {
        temp: avg(srcWx.temp, dstWx.temp),
        feelsLike: avg(srcWx.feelsLike, dstWx.feelsLike),
        humidity: avg(srcWx.humidity, dstWx.humidity),
        windSpeed: avg(srcWx.windSpeed, dstWx.windSpeed),
        windDeg: avg(srcWx.windDeg, dstWx.windDeg),
        pressure: avg(srcWx.pressure, dstWx.pressure),
        vis: +((srcWx.vis + dstWx.vis) / 2).toFixed(1),
        code: dstWx.code,
        uv: avg(srcWx.uv, dstWx.uv)
      };
      const midAQ = {
        aqi: avg(srcAQ.aqi, dstAQ.aqi),
        pm25: +((srcAQ.pm25 + dstAQ.pm25) / 2).toFixed(1),
        pm10: +((srcAQ.pm10 + dstAQ.pm10) / 2).toFixed(1)
      };

      const wxArr = [
        { wx: dstWx, aq: dstAQ },
        { wx: midWx, aq: midAQ },
        { wx: midWx, aq: midAQ }
      ];

      // Create route objects
      let processedRoutes = rawRoutes.slice(0, 3).map((route, i) => {
        const { wx, aq } = wxArr[i] || wxArr[0];
        return {
          id: i + 1,
          icon: ICONS[i],
          name: ROUTE_NAMES[i],
          coords: route.coords,
          dist: {
            car: fmtDist(route.distM),
            bike: fmtDist(route.distM * 1.02),
            bus: fmtDist(route.distM * 1.05),
            walk: fmtDist(route.distM)
          },
          time: {
            car: fmtTime(route.durS, 1),
            bike: fmtTime(route.durS, 1.4),
            bus: fmtTime(route.durS, 1.85),
            walk: fmtTime(route.durS, 8)
          },
          ...wx,
          ...aq,
          score: calcScore(aq.aqi, wx.temp),
          desc: ROUTE_DESCRIPTIONS[i] || ROUTE_DESCRIPTIONS[0]
        };
      });

      // Pad to 3 routes if needed
      while (processedRoutes.length < 3) {
        const i = processedRoutes.length;
        const base = processedRoutes[0];
        const { wx, aq } = wxArr[i] || wxArr[1];
        processedRoutes.push({
          ...base,
          id: i + 1,
          icon: ICONS[i],
          name: ROUTE_NAMES[i],
          desc: ROUTE_DESCRIPTIONS[i],
          coords: base.coords.map(([lat, lng], j) => [
            lat + (j % 2 ? 0.003 : -0.003) * i,
            lng + (j % 2 ? -0.002 : 0.002) * i
          ]),
          ...wx,
          ...aq,
          score: calcScore(aq.aqi, wx.temp)
        });
      }

      setRoutes(processedRoutes);
      
      // Set route times for tabs
      const times = {};
      ['car', 'bike', 'bus', 'walk'].forEach(mode => {
        times[mode] = processedRoutes[0].time[mode];
      });
      setRouteTimes(times);

      // Select best route by default
      const bestRoute = processedRoutes.reduce((best, route) => 
        route.score > best.score ? route : best, processedRoutes[0]
      );
      setSelectedRouteId(bestRoute.id);

    } catch (error) {
      console.error(error);
      alert('⚠️ ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle route selection
  const handleRouteSelect = (id) => {
    setSelectedRouteId(id);
  };

  // Start navigation
  const handleStartNavigation = (id) => {
    setNavigating(true);
    setSelectedRouteId(id);
    
    const route = routes.find(r => r.id === id);
    if (!route) return;

    setNavDistance(route.dist[transportMode]);
    setNavRouteName(route.name);
    setNavProgress(100);

    const etaTime = new Date(Date.now() + toMins(route.time[transportMode]) * 60000);
    setNavEta('Arrive at ' + etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Try real GPS first
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          updateGPSPosition(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to simulation
          simulateGPS(route.coords);
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
      setWatchId(id);
    } else {
      // Simulate GPS
      simulateGPS(route.coords);
    }
  };

  // Stop navigation
  const stopNavigation = () => {
    setNavigating(false);
    
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    if (simTimer !== null) {
      clearInterval(simTimer);
      setSimTimer(null);
    }
    
    setGpsPosition(null);
  };

  // Update GPS position
  const updateGPSPosition = (lat, lng) => {
    setGpsPosition([lat, lng]);
    
    if (!destCoords) return;
    
    const km = haversine(lat, lng, destCoords[0], destCoords[1]);
    setNavDistance(km.toFixed(1) + ' km');
    
    const route = routes.find(r => r.id === selectedRouteId);
    if (route) {
      const totalDist = parseFloat(route.dist[transportMode]);
      const progress = Math.max(0, Math.min(100, (km / totalDist) * 100));
      setNavProgress(progress);
    }
  };

  // Simulate GPS movement
  const simulateGPS = (coords) => {
    setSimIdx(0);
    const timer = setInterval(() => {
      setSimIdx((prevIdx) => {
        if (!navigating || prevIdx >= coords.length) {
          clearInterval(timer);
          return prevIdx;
        }
        updateGPSPosition(coords[prevIdx][0], coords[prevIdx][1]);
        return prevIdx + 1;
      });
    }, 1200);
    setSimTimer(timer);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (simTimer !== null) {
        clearInterval(simTimer);
      }
    };
  }, [watchId, simTimer]);

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <LeftStrip
        onAskMaps={() => setAskMapsOpen((v) => !v)}
        askMapsActive={askMapsOpen}
      />

      {/* Sidebar + Ask Maps panel — share the same column slot */}
      <div className="relative flex h-screen flex-shrink-0">
        <Sidebar
        source={source}
        destination={destination}
        onSourceChange={setSource}
        onDestinationChange={setDestination}
        onSwap={handleSwap}
        onGetRoutes={handleGetRoutes}
        transportMode={transportMode}
        onTransportModeChange={setTransportMode}
        routeTimes={routeTimes}
        isLoading={isLoading}
        routes={routes}
        selectedRouteId={selectedRouteId}
        onRouteSelect={handleRouteSelect}
        onStartNavigation={handleStartNavigation}
        navigating={navigating}
        navDistance={navDistance}
        navEta={navEta}
        navRouteName={navRouteName}
        navProgress={navProgress}
        onStopNavigation={stopNavigation}
        />

        {/* Ask Maps chatbot — slides over the sidebar area */}
        <AnimatePresence>
          {askMapsOpen && (
            <AskMapsChat onClose={() => setAskMapsOpen(false)} />
          )}
        </AnimatePresence>
      </div>

      <Map
        routes={routes}
        source={sourceCoords}
        destination={destCoords}
        selectedRouteId={selectedRouteId}
        onRouteClick={handleRouteSelect}
        gpsPosition={gpsPosition}
        onLocationRequest={updateGPSPosition}
        transportMode={transportMode}
      />
    </div>
  );
}

export default App;
