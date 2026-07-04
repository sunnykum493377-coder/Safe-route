export default function NavigationPanel({ show, distance, eta, routeName, progress, onStop }) {
  if (!show) return null;

  return (
    <div className="p-3.5 border-t border-border-light bg-white flex-shrink-0">
      <div className="text-[30px] font-bold text-google-blue leading-none mb-1">{distance}</div>
      <div className="text-[13px] text-text-secondary mb-1">{eta}</div>
      <div className="text-[12.5px] font-medium mb-1 text-text-primary">{routeName}</div>
      
      {/* Progress bar */}
      <div className="h-1 bg-border-light rounded-sm my-2 overflow-hidden">
        <div 
          className="h-full bg-google-blue rounded-sm transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <button
        onClick={onStop}
        className="block w-full h-9.5 bg-google-red text-white border-none rounded-full mt-2 text-[13px] font-medium cursor-pointer transition-colors hover:bg-red-700"
      >
        🔴 Stop Navigation
      </button>
    </div>
  );
}
