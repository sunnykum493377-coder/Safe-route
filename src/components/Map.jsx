import { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { wmoIcon, wmoLabel } from '../utils/helpers';

// ── Constants ─────────────────────────────────────────────────────────────
const ROUTE_COLORS = { 1: '#1a73e8', 2: '#34a853', 3: '#ea4335' };
const ROUTE_NAMES  = { 1: 'Fastest Route', 2: 'Safest Route', 3: 'Alternate Route' };
const SPIN_SPEED      = 0.06;
const RESUME_DELAY_MS = 5000;

const ROUTE_EXTRA = {
  1: { traffic:'Moderate', road:'Good',     flood:'Low',    aiRec:'✅ Best Route',
       hospital:'Rajindra Hospital – 2.1 km', police:'Patiala Sadar – 1.2 km',  petrol:'HP Pump – 0.6 km' },
  2: { traffic:'Low',      road:'Good',     flood:'Low',    aiRec:'✅ Recommended',
       hospital:'Fortis Patiala – 3.4 km',   police:'Model Town – 2.5 km',      petrol:'IOC Station – 1.1 km' },
  3: { traffic:'Heavy',    road:'Moderate', flood:'Medium', aiRec:'⚠️ Travel with Caution',
       hospital:'Civil Hospital – 4.0 km',   police:'Rajpura City – 0.8 km',    petrol:'BPCL Pump – 2.3 km' },
};

const toML        = ([lat, lng]) => [lng, lat];
const makeGeoJSON = (coords) => ({
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: coords.map(toML) },
});

function routeMidLngLat(coords) {
  const mid = coords[Math.floor(coords.length / 2)];
  return [mid[1], mid[0]];
}

// ── Map tile style ────────────────────────────────────────────────────────
const STYLE = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    topo: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256, maxzoom: 19,
    },
    labels: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256, maxzoom: 19,
    },
  },
  layers: [
    { id: 'topo',   type: 'raster', source: 'topo',   paint: { 'raster-opacity': 1    } },
    { id: 'labels', type: 'raster', source: 'labels', paint: { 'raster-opacity': 0.95 } },
  ],
};

// ── Hover Route Popup ─────────────────────────────────────────────────────
// Compact mini-card that appears on hover. Uses position:fixed so it
// is never clipped by the globe's overflow:hidden circle wrapper.
// pointerEvents:none so it never steals mouse events from the route.
function HoverPopup({ route, transportMode, x, y }) {
  const color = ROUTE_COLORS[route.id] || '#1a73e8';

  // Position popup above the cursor; if too close to top, show below
  const W    = 240;
  const left = Math.max(8, Math.min(x - W / 2, window.innerWidth - W - 8));
  const top  = y > 260 ? y - 254 : y + 18;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1    }}
      exit={{   opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left, top,
        width: `${W}px`,
        zIndex: 9999,
        pointerEvents: 'none',   // ← never intercept mouse, no flicker
        transformOrigin: 'bottom center',
        fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        border: `2px solid ${color}22`,
      }}>
        {/* Coloured header strip */}
        <div style={{
          background: color,
          padding: '8px 12px',
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '12.5px', lineHeight: 1.3 }}>
            {route.icon} {ROUTE_NAMES[route.id]}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10px', marginTop: '1px' }}>
            🛡️ Safety: {route.score}/100
          </div>
        </div>

        {/* Data grid */}
        <div style={{ padding: '8px 10px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 6px' }}>
          {[
            ['📏', route.dist?.[transportMode] ?? '—',     'Distance'],
            ['🕒', route.time?.[transportMode] ?? '—',     'Time'],
            ['🌦️', `${wmoIcon(route.code)} ${wmoLabel(route.code)}`, 'Weather'],
            ['🌡️', `${route.temp}°C`,                     'Temp'],
            ['👁️', `${route.vis} km`,                     'Visibility'],
            ['💨', `${route.windSpeed} km/h`,              'Wind'],
            ['💧', `${route.humidity}%`,                   'Humidity'],
            ['🌿', `AQI ${route.aqi}`,                     'Air Quality'],
          ].map(([icon, value, label]) => (
            <div key={label} style={{
              background: '#f8f9fa',
              borderRadius: '7px',
              padding: '4px 6px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <span style={{ fontSize: '10px', color: '#9aa0a6' }}>{icon} {label}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#202124', marginTop: '1px' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '4px 10px 7px',
          fontSize: '10px',
          color: '#9aa0a6',
          textAlign: 'center',
        }}>
          Click to select this route
        </div>
      </div>

      {/* Downward tail */}
      <div style={{
        width: 0, height: 0, margin: '0 auto',
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid #fff',
        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.08))',
      }} />
    </motion.div>
  );
}

export default function Map({
  routes = [],
  source,
  destination,
  selectedRouteId,
  onRouteClick,
  gpsPosition,
  transportMode = 'car',
}) {
  const containerRef = useRef(null);
  const wrapRef      = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef({ source: null, dest: null, gps: null });

  // Always-current refs (avoids stale closures in map event handlers)
  const routesRef       = useRef(routes);
  const selectedRef     = useRef(selectedRouteId);
  const onClickRef      = useRef(onRouteClick);
  const routeIdsRef     = useRef([]);
  routesRef.current     = routes;
  selectedRef.current   = selectedRouteId;
  onClickRef.current    = onRouteClick;

  // Card state
  const [cardRouteId, setCardRouteId] = useState(null);
  const [cardXY, setCardXY]           = useState({ x: 0, y: 0 });
  const cardAnchorRef                 = useRef(null); // [lng,lat] to reproject on move

  // Flag: did the current click hit a route layer?
  // Used to suppress the map-level 'click' close handler.
  const routeClickedRef = useRef(false);

  // ── Spin ──────────────────────────────────────────────────────────────
  const spinningRef = useRef(false);
  const rafRef      = useRef(null);
  const resumeRef   = useRef(null);

  const startSpin = useCallback(() => {
    if (spinningRef.current) return;
    spinningRef.current = true;
    const tick = () => {
      if (!spinningRef.current || !mapRef.current) return;
      const m = mapRef.current;
      if (m.getZoom() < 4) m.setBearing((m.getBearing() + SPIN_SPEED) % 360);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopSpin = useCallback(() => {
    spinningRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const pauseSpin = useCallback(() => {
    stopSpin();
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(startSpin, RESUME_DELAY_MS);
  }, [stopSpin, startSpin]);

  // ── Reproject card anchor when map moves ─────────────────────────────
  const reprojectCard = useCallback(() => {
    const map = mapRef.current;
    if (!map || !cardAnchorRef.current) return;
    const pt = map.project(cardAnchorRef.current);
    // pt is relative to the MapLibre canvas; the canvas lives inside wrapRef
    // which is positioned in the outer flex container.
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setCardXY({ x: rect.left + pt.x, y: rect.top + pt.y });
  }, []);

  // ── Draw routes ───────────────────────────────────────────────────────
  const drawRoutes = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const routes     = routesRef.current;
    const selectedId = selectedRef.current;
    const onClick    = onClickRef.current;

    // Remove old layers + sources
    routeIdsRef.current.forEach(id => {
      try { if (map.getLayer(id))  map.removeLayer(id);  } catch {}
      try { if (map.getSource(id)) map.removeSource(id); } catch {}
    });
    routeIdsRef.current = [];

    if (!Array.isArray(routes) || !routes.length) return;

    routes.forEach(route => {
      if (!route?.coords?.length) return;

      const sid   = `rsrc-${route.id}`;
      const outId = `rout-${route.id}`;
      const lid   = `rlin-${route.id}`;
      const isActive = route.id === selectedId;
      const color    = ROUTE_COLORS[route.id] || '#1a73e8';

      map.addSource(sid, { type: 'geojson', data: makeGeoJSON(route.coords) });

      // White glow outline
      map.addLayer({
        id: outId, type: 'line', source: sid,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color':   '#fff',
          'line-width':   isActive ? 9 : 6,
          'line-opacity': isActive ? 0.45 : 0.15,
        },
      });

      // Coloured route
      map.addLayer({
        id: lid, type: 'line', source: sid,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color':   color,
          'line-width':   isActive ? 5 : 3,
          'line-opacity': isActive ? 1 : 0.42,
        },
      });

      routeIdsRef.current.push(sid, outId, lid);

      // ── Hover → show popup; leave → hide popup ──────────────────────
      map.on('mouseenter', lid, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        // Highlight: thicken this route, dim others
        routeIdsRef.current.forEach(id => {
          if (!id.startsWith('rlin-')) return;
          const rid = parseInt(id.replace('rlin-', ''), 10);
          try {
            map.setPaintProperty(id, 'line-width',   rid === route.id ? 7 : 2.5);
            map.setPaintProperty(id, 'line-opacity', rid === route.id ? 1 : 0.25);
          } catch {}
        });
        const wrap = wrapRef.current;
        const rect = wrap ? wrap.getBoundingClientRect() : { left: 0, top: 0 };
        setCardRouteId(route.id);
        setCardXY({ x: rect.left + e.point.x, y: rect.top + e.point.y });
      });

      // Card follows cursor along the route
      map.on('mousemove', lid, (e) => {
        const wrap = wrapRef.current;
        const rect = wrap ? wrap.getBoundingClientRect() : { left: 0, top: 0 };
        setCardXY({ x: rect.left + e.point.x, y: rect.top + e.point.y });
      });

      map.on('mouseleave', lid, () => {
        map.getCanvas().style.cursor = '';
        // Restore all route widths/opacities to selected-state defaults
        routeIdsRef.current.forEach(id => {
          if (!id.startsWith('rlin-')) return;
          const rid = parseInt(id.replace('rlin-', ''), 10);
          const active = rid === selectedRef.current;
          try {
            map.setPaintProperty(id, 'line-width',   active ? 5 : 3);
            map.setPaintProperty(id, 'line-opacity', active ? 1 : 0.42);
          } catch {}
        });
        setCardRouteId(null);
      });

      // Click selects the route in sidebar (does not open/close popup)
      map.on('click', lid, () => {
        routeClickedRef.current = true;
        onClick?.(route.id);
      });
    });

    // Stop spin + fly to route bounds
    stopSpin();
    if (resumeRef.current) clearTimeout(resumeRef.current);

    const pts  = routes.flatMap(r => r.coords?.map(toML) ?? []);
    if (pts.length < 2) return;
    const lngs = pts.map(p => p[0]), lats = pts.map(p => p[1]);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: { top:80, bottom:80, left:80, right:80 }, maxZoom:13, duration:1600 }
    );
  }, [stopSpin]);

  // ── Init map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current, style: STYLE, projection: 'globe',
      center: [20, 20], zoom: 1.5, pitch: 0, bearing: 0,
      attributionControl: false, fadeDuration: 100,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');

    map.on('load', () => {
      startSpin();
      if (routesRef.current.length > 0) drawRoutes();
    });

    // Reproject card while panning / zooming
    map.on('move', reprojectCard);

    // Close card when clicking empty map — but SKIP if a route was just clicked
    map.on('click', () => {
      if (routeClickedRef.current) {
        routeClickedRef.current = false; // reset flag, do NOT close card
        return;
      }
      setCardRouteId(null);
      cardAnchorRef.current = null;
    });

    ['mousedown','touchstart','wheel','dblclick'].forEach(evt => map.on(evt, pauseSpin));

    return () => {
      stopSpin();
      if (resumeRef.current) clearTimeout(resumeRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [startSpin, stopSpin, pauseSpin, drawRoutes, reprojectCard]);

  // ── Redraw when routes / selection change ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (map.isStyleLoaded()) drawRoutes();
    else {
      const fn = () => drawRoutes();
      map.once('style.load', fn);
      return () => map.off('style.load', fn);
    }
  }, [routes, selectedRouteId, drawRoutes]);

  // Clear card if routes are removed
  useEffect(() => {
    if (!routes.length) { setCardRouteId(null); cardAnchorRef.current = null; }
  }, [routes]);

  // ── Source marker ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    markersRef.current.source?.remove(); markersRef.current.source = null;
    if (!source) return;
    const el = document.createElement('div'); el.className = 'origin-dot';
    markersRef.current.source = new maplibregl.Marker({ element: el }).setLngLat(toML(source)).addTo(map);
  }, [source]);

  // ── Destination marker ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    markersRef.current.dest?.remove(); markersRef.current.dest = null;
    if (!destination) return;
    const el = document.createElement('div'); el.className = 'dest-pin';
    el.innerHTML = `<svg viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z" fill="#ea4335"/>
      <circle cx="12" cy="12" r="5" fill="white"/></svg>`;
    markersRef.current.dest = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(toML(destination)).addTo(map);
  }, [destination]);

  // ── GPS marker ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    markersRef.current.gps?.remove(); markersRef.current.gps = null;
    if (!gpsPosition) return;
    const el = document.createElement('div'); el.className = 'gps-dot';
    markersRef.current.gps = new maplibregl.Marker({ element: el }).setLngLat(toML(gpsPosition)).addTo(map);
    map.easeTo({ center: toML(gpsPosition), duration: 800 });
  }, [gpsPosition]);

  const cardRoute = cardRouteId ? routes.find(r => r.id === cardRouteId) : null;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      className="flex-1 relative overflow-hidden min-w-0"
      style={{
        background: 'linear-gradient(125deg,#4a7fc1 0%,#6fa3d8 18%,#a0c6e8 38%,#c5dff2 56%,#dceefa 72%,#eaf5fb 87%,#f1f8fd 100%)',
      }}
    >
      {/* Spotlight */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
        background:'radial-gradient(ellipse 58% 58% at 52% 50%, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.15) 42%, transparent 68%)',
      }} />

      {/* Atmosphere */}
      <svg aria-hidden="true" style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'min(calc(100% - 48px + 140px), calc(100vh - 80px + 140px))',
        height:'min(calc(100% - 48px + 140px), calc(100vh - 80px + 140px))',
        pointerEvents:'none', zIndex:4, filter:'blur(18px)', overflow:'visible',
      }} viewBox="-20 -20 240 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="atm" cx="50%" cy="50%" r="50%">
            <stop offset="82%"  stopColor="#7ec8f0" stopOpacity="0"    />
            <stop offset="88%"  stopColor="#7ec8f0" stopOpacity="0.38" />
            <stop offset="93%"  stopColor="#5ab4e8" stopOpacity="0.52" />
            <stop offset="98%"  stopColor="#3da0dc" stopOpacity="0.30" />
            <stop offset="105%" stopColor="#2090d0" stopOpacity="0.08" />
            <stop offset="115%" stopColor="#2090d0" stopOpacity="0"    />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="110" fill="url(#atm)" />
      </svg>

      {/* Globe circle — map tiles clipped to circle */}
      <div ref={wrapRef} style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'min(calc(100% - 48px), calc(100vh - 80px))',
        height:'min(calc(100% - 48px), calc(100vh - 80px))',
        borderRadius:'50%', overflow:'hidden', zIndex:3,
        outline:'1px solid rgba(210,238,255,0.50)', outlineOffset:'-1px',
      }}>
        <div ref={containerRef} style={{ width:'100%', height:'100%' }} />
      </div>

      {/* ── Hover popup — position:fixed, pointerEvents:none ── */}
      <AnimatePresence>
        {cardRoute && (
          <HoverPopup
            key={cardRoute.id}
            route={cardRoute}
            transportMode={transportMode}
            x={cardXY.x}
            y={cardXY.y}
          />
        )}
      </AnimatePresence>

      {/* Attribution */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'24px', zIndex:10,
        background:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center',
        padding:'0 12px', fontSize:'10.5px', color:'#555',
        pointerEvents:'none', userSelect:'none',
      }}>
        Map data © Esri · © OpenStreetMap contributors
      </div>
    </div>
  );
}
