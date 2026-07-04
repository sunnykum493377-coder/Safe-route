export default function InfoBar({ show, routeCount, highAQI }) {
  if (!show) return null;

  return (
    <div className="flex bg-bg-gray px-3.5 py-1.5 text-[12.5px] text-text-secondary font-medium items-center justify-between border-b border-border-light flex-shrink-0 gap-1.5">
      <span>{routeCount} routes found · Smart Analysis</span>
      {highAQI && (
        <span className="text-[11px] font-semibold text-google-red-dark bg-red-100 px-2 py-0.5 rounded-xl">
          ⚠️ High AQI
        </span>
      )}
    </div>
  );
}
