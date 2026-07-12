const TRAVEL_MODE_LABELS = {
  normal:    { icon: '🚗', label: 'Normal Travel'     },
  women:     { icon: '🌸', label: 'Women Safety Mode' },
  pregnancy: { icon: '🤱', label: 'Pregnancy Mode'    },
  night:     { icon: '🌙', label: 'Night Travel Mode' },
};

export default function InfoBar({ show, routeCount, highAQI, travelMode }) {
  if (!show) return null;

  const modeInfo = TRAVEL_MODE_LABELS[travelMode] || TRAVEL_MODE_LABELS.normal;

  return (
    <div className="flex bg-bg-gray px-3.5 py-1.5 text-[12.5px] text-text-secondary font-medium items-center justify-between border-b border-border-light flex-shrink-0 gap-1.5">
      <div className="flex items-center gap-1.5">
        <span>{routeCount} routes found</span>
        <span className="text-border-dark">·</span>
        <span className="flex items-center gap-1">
          <span>{modeInfo.icon}</span>
          <span className="text-[11.5px] font-semibold text-text-primary">{modeInfo.label}</span>
        </span>
      </div>
      {highAQI && (
        <span className="text-[11px] font-semibold text-google-red-dark bg-red-100 px-2 py-0.5 rounded-xl">
          ⚠️ High AQI
        </span>
      )}
    </div>
  );
}
