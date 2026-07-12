import { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { wmoIcon, wmoLabel } from '../utils/helpers';

// ── Constants ─────────────────────────────────────────────────────────────
// Route 1 = blue (AI recommended), Route 2 = green (alt 1), Route 3 = orange (alt 2)
const ROUTE_COLORS = { 1: '#1a73e8', 2: '#00a550', 3: '#f57c00' };
const ROUTE_GLOW   = { 1: '#4d9ff5', 2: '#34c97a', 3: '#ffb04d' }; // lighter tint for glow layers
const ROUTE_NAMES  = { 1: 'Fastest Route', 2: 'Safest Route', 3: 'Alternate Route' };
const SPIN_SPEED      = 0.04;
const RESUME_DELAY_MS = 5000;

// Per-route pixel offset so routes that share the same road segment
// render side-by-side instead of stacking on top of each other.
// MapLibre `line-offset` is in pixels; positive = right of direction.
const ROUTE_OFFSET = { 1: 0, 2: 7, 3: -7 };

// Layer geometry per state
const LINE_PARAMS = {
  // selected route
  active: {
    glow2Width:  22, glow2Opacity: 0.10,  // outermost soft halo
    glow1Width:  14, glow1Opacity: 0.22,  // inner glow
    casingWidth: 10, casingOpacity: 0.90, // white casing
    lineWidth:    7, lineOpacity:   1.00, // coloured core
    dashWidth:    4, dashOpacity:   0.85, // animated flow dash
  },
  // inactive route
  idle: {
    glow2Width:   0, glow2Opacity: 0.00,
    glow1Width:   9, glow1Opacity: 0.10,
    casingWidth:  7, casingOpacity: 0.50,
    lineWidth:    5, lineOpacity:   0.55,
    dashWidth:    0, dashOpacity:   0.00,
  },
  // hovered-but-not-selected
  hover: {
    glow2Width:  16, glow2Opacity: 0.14,
    glow1Width:  11, glow1Opacity: 0.28,
    casingWidth:  9, casingOpacity: 0.80,
    lineWidth:    6, lineOpacity:   0.90,
    dashWidth:    0, dashOpacity:   0.00,
  },
  // all other routes while one is being hovered
  dimmed: {
    glow2Width:   0, glow2Opacity: 0.00,
    glow1Width:   0, glow1Opacity: 0.00,
    casingWidth:  0, casingOpacity: 0.00,
    lineWidth:    4, lineOpacity:   0.22,
    dashWidth:    0, dashOpacity:   0.00,
  },
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

// ── Map tile style — satellite imagery matching Google Maps globe look ────
const STYLE = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    // Esri World Imagery — photorealistic satellite, same source Google uses
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles © Esri — Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN',
    },
    // Esri Reference overlay — country borders, city labels, roads on top of satellite
    labels: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    { id: 'satellite', type: 'raster', source: 'satellite', paint: { 'raster-opacity': 1 } },
    // Labels sit on top at ~90% opacity so they read clearly over imagery
    { id: 'labels',    type: 'raster', source: 'labels',    paint: { 'raster-opacity': 0.90 } },
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
        <div style={{ background: color, padding: '8px 12px' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '12.5px', lineHeight: 1.3 }}>
            {route.icon} {route.name || ROUTE_NAMES[route.id]}
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
            ['🚦', route.trafficStatus || '—',             'Traffic'],
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

        {/* AI Recommendation */}
        {route.aiRec && (
          <div style={{
            margin: '0 10px 6px',
            background: `${color}18`,
            borderRadius: '8px',
            padding: '5px 8px',
            fontSize: '10px',
            color: color,
            fontWeight: 600,
          }}>
            🤖 {route.aiRec}
          </div>
        )}

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
      // Only spin when zoomed out (globe view) and bearing is neutral
      if (m.getZoom() < 4) {
        // Earth rotates West → East: landmasses appear to move right,
        // so the center longitude decreases (camera moves west relative to Earth).
        const center = m.getCenter();
        const newLng = center.lng - SPIN_SPEED;
        m.setCenter([newLng, center.lat], { animate: false });
      }
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

  // ── Apply layer paint properties for a given state ───────────────────
  const applyRouteState = useCallback((map, routeId, state, color, glowColor, offset) => {
    const p  = LINE_PARAMS[state];
    const g2 = `rglo2-${routeId}`;
    const g1 = `rglo1-${routeId}`;
    const ca = `rcas-${routeId}`;
    const li = `rlin-${routeId}`;
    const da = `rdash-${routeId}`;

    const trySet = (layerId, prop, val) => {
      try { if (map.getLayer(layerId)) map.setPaintProperty(layerId, prop, val); } catch {}
    };

    trySet(g2, 'line-width',   p.glow2Width);
    trySet(g2, 'line-opacity', p.glow2Opacity);
    trySet(g1, 'line-width',   p.glow1Width);
    trySet(g1, 'line-opacity', p.glow1Opacity);
    trySet(ca, 'line-width',   p.casingWidth);
    trySet(ca, 'line-opacity', p.casingOpacity);
    trySet(li, 'line-width',   p.lineWidth);
    trySet(li, 'line-opacity', p.lineOpacity);
    trySet(da, 'line-width',   p.dashWidth);
    trySet(da, 'line-opacity', p.dashOpacity);
  }, []);

  // ── Draw routes ───────────────────────────────────────────────────────
  const drawRoutes = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const routes     = routesRef.current;
    const selectedId = selectedRef.current;
    const onClick    = onClickRef.current;

    // ── Tear down old layers + sources ────────────────────────────────
    routeIdsRef.current.forEach(id => {
      try { if (map.getLayer(id))  map.removeLayer(id);  } catch {}
      try { if (map.getSource(id)) map.removeSource(id); } catch {}
    });
    routeIdsRef.current = [];

    if (!Array.isArray(routes) || !routes.length) return;

    // ── Draw inactive routes first, selected last (on top) ───────────
    const drawOrder = [
      ...routes.filter(r => r.id !== selectedId),
      ...routes.filter(r => r.id === selectedId),
    ];

    drawOrder.forEach(route => {
      if (!route?.coords?.length) return;

      const rid      = route.id;
      const color    = ROUTE_COLORS[rid] || '#1a73e8';
      const glow     = ROUTE_GLOW[rid]   || color;
      const offset   = ROUTE_OFFSET[rid] ?? 0;
      const isActive = rid === selectedId;
      const state    = isActive ? 'active' : 'idle';
      const p        = LINE_PARAMS[state];

      const sid  = `rsrc-${rid}`;
      const g2   = `rglo2-${rid}`;
      const g1   = `rglo1-${rid}`;
      const ca   = `rcas-${rid}`;
      const li   = `rlin-${rid}`;
      const da   = `rdash-${rid}`;

      map.addSource(sid, { type: 'geojson', data: makeGeoJSON(route.coords) });

      // Layer 1 — outermost soft halo (wide, very transparent, same color as glow)
      map.addLayer({
        id: g2, type: 'line', source: sid,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color':   glow,
          'line-width':   p.glow2Width,
          'line-opacity': p.glow2Opacity,
          'line-blur':    6,
          'line-offset':  offset,
        },
      });

      // Layer 2 — inner glow halo
      map.addLayer({
        id: g1, type: 'line', source: sid,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color':   glow,
          'line-width':   p.glow1Width,
          'line-opacity': p.glow1Opacity,
          'line-blur':    3,
          'line-offset':  offset,
        },
      });

      // Layer 3 — white casing (gives the route a clean border)
      map.addLayer({
        id: ca, type: 'line', source: sid,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color':   '#ffffff',
          'line-width':   p.casingWidth,
          'line-opacity': p.casingOpacity,
          'line-offset':  offset,
        },
      });

      // Layer 4 — main coloured route line
      map.addLayer({
        id: li, type: 'line', source: sid,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color':   color,
          'line-width':   p.lineWidth,
          'line-opacity': p.lineOpacity,
          'line-offset':  offset,
        },
      });

      // Layer 5 — animated dash overlay (selected route only)
      // Creates a flowing "traffic direction" animation on the primary route.
      map.addLayer({
        id: da, type: 'line', source: sid,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color':   '#ffffff',
          'line-width':   p.dashWidth,
          'line-opacity': p.dashOpacity,
          'line-dasharray': [0, 3, 2],   // gap → short white dot rhythm
          'line-offset':  offset,
        },
      });

      routeIdsRef.current.push(sid, g2, g1, ca, li, da);

      // ── Hover interactions ────────────────────────────────────────
      map.on('mouseenter', li, (e) => {
        map.getCanvas().style.cursor = 'pointer';

        // Highlight hovered, dim all others
        routes.forEach(r => {
          const rState = r.id === rid ? 'hover' : 'dimmed';
          applyRouteState(map, r.id, rState,
            ROUTE_COLORS[r.id], ROUTE_GLOW[r.id], ROUTE_OFFSET[r.id] ?? 0);
        });

        const wrap = wrapRef.current;
        const rect = wrap ? wrap.getBoundingClientRect() : { left: 0, top: 0 };
        setCardRouteId(rid);
        setCardXY({ x: rect.left + e.point.x, y: rect.top + e.point.y });
      });

      map.on('mousemove', li, (e) => {
        const wrap = wrapRef.current;
        const rect = wrap ? wrap.getBoundingClientRect() : { left: 0, top: 0 };
        setCardXY({ x: rect.left + e.point.x, y: rect.top + e.point.y });
      });

      map.on('mouseleave', li, () => {
        map.getCanvas().style.cursor = '';
        // Restore each route to its selected / idle state
        routes.forEach(r => {
          const rState = r.id === selectedRef.current ? 'active' : 'idle';
          applyRouteState(map, r.id, rState,
            ROUTE_COLORS[r.id], ROUTE_GLOW[r.id], ROUTE_OFFSET[r.id] ?? 0);
        });
        setCardRouteId(null);
      });

      map.on('click', li, () => {
        routeClickedRef.current = true;
        onClick?.(rid);
      });
    });

    // Stop spin + fly to bounding box of all routes
    stopSpin();
    if (resumeRef.current) clearTimeout(resumeRef.current);

    const pts  = routes.flatMap(r => r.coords?.map(toML) ?? []);
    if (pts.length < 2) return;
    const lngs = pts.map(p => p[0]), lats = pts.map(p => p[1]);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: { top: 80, bottom: 80, left: 80, right: 80 }, maxZoom: 13, duration: 1600 }
    );
  }, [stopSpin, applyRouteState]);

  // ── Init map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current, style: STYLE, projection: 'globe',
      center: [20, 20], zoom: 1.5,
      pitch: 0,
      bearing: 0,   // north always up — rotation is via longitude, not bearing
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
        // Google Maps background: clean white centre fading to a
        // very light cool grey-blue at the edges — exactly like the screenshot
        background: 'radial-gradient(ellipse 70% 70% at 50% 50%, #ffffff 0%, #eef4fb 35%, #ddeaf5 60%, #c8ddf0 80%, #b8d3ec 100%)',
      }}
    >
      {/* ── Subtle vignette so the corners don't look clipped ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(180,210,235,0.35) 100%)',
      }} />

      {/* ── Atmosphere halo — soft blue glow around the globe ── */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width:  'min(calc(100% - 48px + 120px), calc(100vh - 80px + 120px))',
          height: 'min(calc(100% - 48px + 120px), calc(100vh - 80px + 120px))',
          pointerEvents: 'none', zIndex: 2,
          filter: 'blur(16px)',
          overflow: 'visible',
        }}
        viewBox="-20 -20 240 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="atmLight" cx="50%" cy="50%" r="50%">
            <stop offset="80%"  stopColor="#7ec8f0" stopOpacity="0"    />
            <stop offset="86%"  stopColor="#7ec8f0" stopOpacity="0.30" />
            <stop offset="91%"  stopColor="#5ab4e8" stopOpacity="0.45" />
            <stop offset="96%"  stopColor="#3da0dc" stopOpacity="0.25" />
            <stop offset="104%" stopColor="#2090d0" stopOpacity="0.06" />
            <stop offset="115%" stopColor="#2090d0" stopOpacity="0"    />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="110" fill="url(#atmLight)" />
      </svg>

      {/* ── Globe circle — satellite tiles clipped to circle ── */}
      <div
        ref={wrapRef}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width:  'min(calc(100% - 48px), calc(100vh - 80px))',
          height: 'min(calc(100% - 48px), calc(100vh - 80px))',
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 3,
          // Thin blue-grey border ring + very subtle edge darkening
          outline: '1.5px solid rgba(140,190,230,0.55)',
          outlineOffset: '-1px',
          boxShadow: '0 4px 32px rgba(80,140,200,0.22), 0 1px 6px rgba(80,140,200,0.12), inset 0 0 40px 8px rgba(0,0,0,0.18)',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
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
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '22px', zIndex: 10,
        background: 'rgba(255,255,255,0.60)', display: 'flex', alignItems: 'center',
        padding: '0 12px', fontSize: '10px', color: '#70757a',
        pointerEvents: 'none', userSelect: 'none',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}>
        Map data © Esri · Maxar · © OpenStreetMap contributors
      </div>
    </div>
  );
}
