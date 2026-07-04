export default function AlertBanner({ show }) {
  if (!show) return null;

  return (
    <div className="flex bg-yellow-50 border-l-[3px] border-google-yellow px-3.5 py-2 text-xs text-text-secondary items-start gap-2 flex-shrink-0">
      <span className="text-base">⚠️</span>
      <div>
        <strong className="block text-text-primary text-[12.5px] mb-0.5">High AQI Alert</strong>
        <span>Poor air quality on fastest route. Safe route recommended.</span>
      </div>
    </div>
  );
}
