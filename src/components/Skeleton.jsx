export default function Skeleton({ show }) {
  if (!show) return null;

  return (
    <div className="p-2.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg p-3.5 mb-2.5 shadow-sm">
          <div className="h-4 rounded mb-2 shimmer" style={{ width: '55%' }}></div>
          <div className="h-3 rounded mb-2 shimmer" style={{ width: '88%' }}></div>
          <div className="h-8 rounded-2xl mt-1.5 shimmer" style={{ width: '100%' }}></div>
        </div>
      ))}
    </div>
  );
}
