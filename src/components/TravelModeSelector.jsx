import { motion } from 'framer-motion';

export const TRAVEL_MODES = [
  {
    id: 'normal',
    icon: '🚗',
    label: 'Normal Travel',
    subtitle: 'Fastest & shortest route',
    color: '#1a73e8',
    bg: '#e8f0fe',
    borderColor: '#1a73e8',
  },
  {
    id: 'women',
    icon: '🌸',
    label: 'Women Safety',
    subtitle: 'Lit roads · CCTV · Police nearby',
    color: '#d81b60',
    bg: '#fce4ec',
    borderColor: '#d81b60',
  },
  {
    id: 'pregnancy',
    icon: '🤱',
    label: 'Pregnancy Travel',
    subtitle: 'Smooth roads · Hospitals nearby',
    color: '#7b1fa2',
    bg: '#f3e5f5',
    borderColor: '#7b1fa2',
  },
  {
    id: 'night',
    icon: '🌙',
    label: 'Night Travel',
    subtitle: 'Well-lit · Patrolled · Safe',
    color: '#1565c0',
    bg: '#e3f2fd',
    borderColor: '#1565c0',
  },
];

export default function TravelModeSelector({ selectedMode, onModeChange }) {
  return (
    <div className="px-3 py-2.5 border-b border-border-light flex-shrink-0 bg-bg-gray-light">
      {/* Section label */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
          Travel Mode
        </span>
        <div className="flex-1 h-px bg-border-light" />
        <span className="text-[10px] text-text-quaternary">AI-Optimized Routes</span>
      </div>

      {/* Mode buttons grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {TRAVEL_MODES.map((mode) => {
          const isActive = selectedMode === mode.id;
          return (
            <motion.button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              whileTap={{ scale: 0.97 }}
              style={{
                background: isActive ? mode.bg : '#fff',
                borderColor: isActive ? mode.color : '#dadce0',
                color: isActive ? mode.color : '#5f6368',
                borderWidth: isActive ? '2px' : '1px',
              }}
              className="relative flex items-center gap-2 rounded-xl px-2.5 py-2 border cursor-pointer transition-all text-left shadow-sm hover:shadow-md"
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="travel-mode-dot"
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: mode.color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}

              <span className="text-[20px] leading-none flex-shrink-0">{mode.icon}</span>
              <div className="min-w-0">
                <div
                  className="text-[11.5px] font-semibold leading-tight truncate"
                  style={{ color: isActive ? mode.color : '#202124' }}
                >
                  {mode.label}
                </div>
                <div className="text-[9.5px] text-text-quaternary leading-tight mt-0.5 truncate">
                  {mode.subtitle}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
