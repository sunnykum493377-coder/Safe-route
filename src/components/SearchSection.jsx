import { TRANSPORT_MODES } from '../utils/constants';

export default function SearchSection({ 
  source, 
  destination, 
  onSourceChange, 
  onDestinationChange, 
  onSwap, 
  onGetRoutes,
  transportMode,
  onTransportModeChange,
  routeTimes,
  isLoading
}) {
  const isValid = source.trim() && destination.trim();

  return (
    <div className="p-3.5 border-b border-border-light flex-shrink-0 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-0.5 pb-2.5">
        <span className="text-xl">🛡️</span>
        <span className="text-[17px] font-bold text-google-blue tracking-tight">ShieldRoute</span>
        <span className="text-[11px] text-text-tertiary ml-0.5">Smart Routing</span>
      </div>

      {/* Inputs */}
      <div className="flex items-stretch gap-2">
        {/* Dots */}
        <div className="w-4.5 flex-shrink-0 flex flex-col items-center py-1.5 gap-0">
          <div className="w-[11px] h-[11px] border-[2.5px] border-google-blue rounded-full bg-white flex-shrink-0"></div>
          <div className="w-0.5 flex-1 min-h-[14px] my-0.5" style={{
            background: 'repeating-linear-gradient(to bottom, #bdc1c6 0, #bdc1c6 4px, transparent 4px, transparent 8px)'
          }}></div>
          <div className="w-[11px] h-[11px] bg-google-red rounded-full flex-shrink-0" style={{
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)'
          }}></div>
        </div>

        {/* Input fields */}
        <div className="flex-1 flex flex-col gap-1.5">
          <input
            type="text"
            className="h-10 w-full px-3.5 text-sm border-none outline-none rounded-full shadow-md transition-shadow focus:shadow-lg"
            placeholder="Choose starting point"
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            autoComplete="off"
          />
          <input
            type="text"
            className="h-10 w-full px-3.5 text-sm border-none outline-none rounded-full shadow-md transition-shadow focus:shadow-lg"
            placeholder="Choose destination"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Swap button */}
        <div className="w-8.5 flex-shrink-0 flex items-center justify-center">
          <button
            onClick={onSwap}
            className="w-7.5 h-7.5 border border-border-medium rounded-full bg-white cursor-pointer flex items-center justify-center text-text-secondary text-[15px] shadow-sm transition-colors hover:bg-bg-gray"
            title="Swap"
          >
            ⇅
          </button>
        </div>
      </div>

      {/* Transport tabs */}
      <div className="flex mt-2.5 border-t border-border-light">
        {TRANSPORT_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onTransportModeChange(mode.id)}
            className={`flex-1 h-[54px] border-none bg-transparent border-b-[3px] ${
              transportMode === mode.id ? 'border-google-blue' : 'border-transparent'
            } flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors hover:bg-bg-gray ${
              transportMode === mode.id ? 'text-google-blue' : 'text-text-tertiary'
            }`}
          >
            <span className="text-[17px] leading-none">{mode.icon}</span>
            <span className="text-[10px] font-medium">{mode.label}</span>
            <span className="text-[10px]">{routeTimes[mode.id] || '--'}</span>
          </button>
        ))}
      </div>

      {/* Get Routes button */}
      <button
        onClick={onGetRoutes}
        disabled={!isValid || isLoading}
        className="block w-full h-10 mt-2.5 bg-google-blue text-white border-none rounded-full text-sm font-medium cursor-pointer shadow-md transition-colors hover:bg-google-blue-dark disabled:bg-border-medium disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isLoading ? 'Finding routes…' : 'Get Routes'}
      </button>
    </div>
  );
}
