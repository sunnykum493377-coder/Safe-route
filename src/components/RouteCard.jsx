import { scoreColor, aqiInfo, windDir, wmoIcon, wmoLabel, uvLabel } from '../utils/helpers';

// Route colors — must match Map.jsx ROUTE_COLORS exactly
const ROUTE_COLORS = {
  1: '#1a73e8', // Blue  — AI Recommended
  2: '#00a550', // Green — Alternative 1
  3: '#f57c00', // Orange — Alternative 2
};

// Travel mode accent colors
const MODE_COLORS = {
  normal:    '#1a73e8',
  women:     '#d81b60',
  pregnancy: '#7b1fa2',
  night:     '#1565c0',
};

const MODE_BG = {
  normal:    '#e8f0fe',
  women:     '#fce4ec',
  pregnancy: '#f3e5f5',
  night:     '#e3f2fd',
};

export default function RouteCard({ 
  route, 
  isBest, 
  isSelected, 
  transportMode, 
  onSelect, 
  onNavigate,
  index,
  travelMode = 'normal',
}) {
  const ai = aqiInfo(route.aqi);
  const aqiDeg = Math.min(180, Math.round((route.aqi / 100) * 180));
  const modeColor = MODE_COLORS[travelMode] || MODE_COLORS.normal;
  const modeBg    = MODE_BG[travelMode]    || MODE_BG.normal;

  // Extra travel-mode safety fields
  const hasSafetyExtras = travelMode !== 'normal' && (route.safetyLabel || route.cctv || route.lighting);

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-lg p-2 mb-1.5 cursor-pointer relative shadow-sm transition-all card-in ${
        isSelected 
          ? 'border-l-4 bg-blue-50 shadow-lg' 
          : 'border-l-4 hover:shadow-md'
      }`}
      style={{ 
        animationDelay: `${index * 0.08}s`,
        borderLeftColor: ROUTE_COLORS[route.id] || ROUTE_COLORS[1]
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
            style={{ backgroundColor: ROUTE_COLORS[route.id] || ROUTE_COLORS[1] }}
            title={`Route ${route.id}`}
          ></div>
          <span className="text-[15px]">{route.icon}</span>
          <span className="text-[13px] font-semibold text-text-primary">{route.name}</span>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: scoreColor(route.score) }}
        >
          {route.score}
        </div>
      </div>

      {/* Best tag */}
      {isBest && (
        <div className="inline-block bg-google-green-light text-google-green text-[9.5px] font-bold px-1.5 py-0.5 rounded-xl tracking-wide mb-1 uppercase">
          ⭐ Best Route
        </div>
      )}

      {/* ── Travel-mode safety badge row ── */}
      {hasSafetyExtras && (
        <div
          className="flex flex-wrap gap-1 mb-1.5 p-1.5 rounded-lg"
          style={{ background: modeBg }}
        >
          {route.safetyLabel && (
            <span
              className="text-[9.5px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: modeColor, color: '#fff' }}
            >
              🛡️ {route.safetyLabel}
            </span>
          )}
          {route.lighting && (
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-white border border-border-light text-text-secondary">
              💡 Lighting: {route.lighting}
            </span>
          )}
          {route.cctv && (
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-white border border-border-light text-text-secondary">
              📹 CCTV: {route.cctv}
            </span>
          )}
          {route.trafficStatus && (
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-white border border-border-light text-text-secondary">
              🚦 Traffic: {route.trafficStatus}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1 mb-1.5 bg-bg-gray-light rounded-lg p-1.5">
        <div className="text-center">
          <div className="text-[10px] text-text-tertiary">Distance</div>
          <div className="text-[13px] font-bold text-google-blue">{route.dist[transportMode]}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-text-tertiary">Travel Time</div>
          <div className="text-[13px] font-bold text-google-blue">{route.time[transportMode]}</div>
        </div>
      </div>

      {/* ── Nearby essentials (mode-specific) ── */}
      {(route.hospital || route.police) && (
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          {route.hospital && (
            <div className="bg-bg-gray-light rounded-lg p-1.5 border border-border-light">
              <div className="text-[9.5px] text-text-quaternary">🏥 Hospital</div>
              <div className="text-[10px] font-semibold text-text-primary leading-tight mt-0.5">{route.hospital}</div>
            </div>
          )}
          {route.police && (
            <div className="bg-bg-gray-light rounded-lg p-1.5 border border-border-light">
              <div className="text-[9.5px] text-text-quaternary">👮 Police</div>
              <div className="text-[10px] font-semibold text-text-primary leading-tight mt-0.5">{route.police}</div>
            </div>
          )}
        </div>
      )}

      {/* Rest stop (Pregnancy mode) */}
      {route.restStop && (
        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-lg p-1.5 mb-1.5">
          <span className="text-sm">☕</span>
          <div>
            <div className="text-[9.5px] text-text-quaternary">Nearest Rest Stop</div>
            <div className="text-[10.5px] font-semibold text-text-primary">{route.restStop}</div>
          </div>
        </div>
      )}

      {/* Weather Card */}
      <div className="bg-bg-gray-light rounded-[8px] p-2 mb-1.5 border border-border-light">
        <div className="flex gap-2 mb-1.5">
          {/* Main weather */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="text-[28px] leading-none">{wmoIcon(route.code)}</div>
            <div>
              <div className="text-[18px] font-bold text-text-primary leading-none">{route.temp}°C</div>
              <div className="text-[11px] text-text-secondary mt-0.5">{wmoLabel(route.code)}</div>
              <div className="text-[10px] text-text-quaternary">Feels like {route.feelsLike}°C</div>
            </div>
          </div>

          {/* Weather grid */}
          <div className="grid grid-cols-2 gap-1 flex-1">
            <WeatherCell value={`${route.vis} km`} label="Visibility">
              <span className={`text-[9.5px] font-semibold ${
                route.vis >= 5 ? 'text-google-green' : route.vis >= 2 ? 'text-google-orange' : 'text-google-red'
              }`}>
                {route.vis >= 5 ? 'Good' : route.vis >= 2 ? 'Fair' : 'Poor'}
              </span>
            </WeatherCell>
            <WeatherCell value={`${route.pressure} mb`} label="Pressure" />
            <WeatherCell value={`${route.windSpeed} km/h`} label={`Wind ${windDir(route.windDeg)}`} />
            <WeatherCell value={`${route.humidity}%`} label="Humidity">
              <span className={`text-[9.5px] font-semibold ${
                route.humidity > 70 ? 'text-google-orange' : 'text-google-green'
              }`}>
                {route.humidity > 70 ? 'Humid' : 'OK'}
              </span>
            </WeatherCell>
          </div>
        </div>

        {/* AQI Row */}
        <div className="flex items-center gap-1.5 bg-white rounded-lg p-1.5 border border-border-light">
          <div className="flex-1">
            <div className="text-[9.5px] text-text-quaternary">AQI (European scale)</div>
            <div className="text-[18px] font-bold leading-none" style={{ color: ai.color }}>
              {route.aqi}
            </div>
            <span className={`pill ${ai.cls} inline-block`}>{ai.lbl}</span>
            <div className="text-[9.5px] text-text-quaternary mt-0.5">
              PM2.5: {route.pm25} · PM10: {route.pm10}
            </div>
          </div>
          
          {/* AQI Gauge */}
          <svg viewBox="0 0 80 44" width="60" height="33">
            <path d="M8,40 A32,32 0 0,1 72,40" fill="none" stroke="#e8eaed" strokeWidth="7" strokeLinecap="round"/>
            <path 
              d="M8,40 A32,32 0 0,1 72,40" 
              fill="none" 
              stroke={ai.color} 
              strokeWidth="7" 
              strokeLinecap="round" 
              strokeDasharray={`${aqiDeg * 0.558} 200`}
            />
          </svg>

          {/* UV Index */}
          <div className="flex-shrink-0 text-center">
            <div className="text-[12px] font-bold text-text-primary">{route.uv}</div>
            <div className="text-[9.5px] text-text-quaternary">UV Index</div>
            <div className={`text-[9.5px] font-semibold ${
              route.uv <= 2 ? 'text-google-green' : route.uv <= 5 ? 'text-google-orange' : 'text-google-red'
            }`}>
              {uvLabel(route.uv)}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Recommendation ── */}
      {route.aiRec ? (
        <div
          className="rounded-lg px-2 py-1.5 text-[11px] mb-1.5 leading-snug font-medium"
          style={{ background: modeBg, color: modeColor }}
        >
          🤖 AI: {route.aiRec}
        </div>
      ) : (
        <div className="bg-google-blue-light rounded-lg px-2 py-1.5 text-[11px] text-blue-700 mb-1.5 leading-snug">
          {route.desc}
        </div>
      )}

      {/* Select Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate();
        }}
        className={`block w-full h-8 border-none rounded-2xl text-[12.5px] font-medium cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-google-green text-white' 
            : 'bg-google-blue text-white hover:bg-google-blue-dark'
        }`}
      >
        {isSelected ? '✓ Route Selected' : 'Select This Route'}
      </button>

      <style jsx>{`
        .pill {
          font-size: 10px;
          font-weight: 600;
          padding: 1px 7px;
          border-radius: 10px;
        }
        .p-good { background: #e6f4ea; color: #137333; }
        .p-moderate { background: #fef7e0; color: #b06000; }
        .p-poor { background: #fce8e6; color: #c5221f; }
        .p-hot { background: #fce8e6; color: #c5221f; }
      `}</style>
    </div>
  );
}

function WeatherCell({ value, label, children }) {
  return (
    <div className="bg-white rounded-lg p-1 px-1.5 border border-border-light">
      <div className="text-[12px] font-bold text-text-primary">{value}</div>
      <div className="text-[9.5px] text-text-quaternary">{label}</div>
      {children}
    </div>
  );
}
