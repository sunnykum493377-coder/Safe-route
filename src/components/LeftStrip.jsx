export default function LeftStrip({ onAskMaps, askMapsActive }) {
  return (
    <div className="w-14 min-w-14 h-screen bg-white border-r border-border-light flex flex-col items-center py-2.5 gap-0.5 z-15 flex-shrink-0 shadow-sm">

      {/* Search — active/highlighted */}
      <button className="strip-btn active" title="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className="text-[9px] font-medium leading-none">Search</span>
      </button>

      {/* ── Ask Maps button — matches Google Maps reference exactly ── */}
      <button
        className={`ask-maps-btn${askMapsActive ? ' ask-maps-btn--active' : ''}`}
        title="Ask Maps"
        onClick={onAskMaps}
        aria-pressed={askMapsActive}
      >
        {/* Rounded square with gradient border + light-blue fill */}
        <span className="ask-maps-icon-wrap">
          {/* AI Search icon: magnifying glass + 4-point sparkle */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Magnifying glass circle */}
            <circle cx="10" cy="11" r="6" stroke="#3c6bc9" strokeWidth="2.2" fill="none"/>
            {/* Magnifying glass handle */}
            <line x1="14.5" y1="15.5" x2="19" y2="20" stroke="#3c6bc9" strokeWidth="2.2" strokeLinecap="round"/>
            {/* 4-point sparkle (diamond star) at top-right of magnifier */}
            <path
              d="M17 2 L17.7 4.3 L20 5 L17.7 5.7 L17 8 L16.3 5.7 L14 5 L16.3 4.3 Z"
              fill="#3c6bc9"
            />
          </svg>
        </span>
      </button>
      {/* Label sits below the button box, same as Google Maps */}
      <span className="ask-maps-label" onClick={onAskMaps} style={{cursor:'pointer'}}>Ask Maps</span>

      {/* Saved */}
      <button className="strip-btn" title="Saved places">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <span className="text-[9px] font-medium leading-none">Saved</span>
      </button>

      {/* Recents */}
      <button className="strip-btn" title="Recents">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="text-[9px] font-medium leading-none">Recents</span>
      </button>

      <div className="w-8 h-px bg-border-light my-1"></div>

      {/* Places */}
      <button className="strip-btn" title="Your location">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span className="text-[9px] font-medium leading-none">Places</span>
      </button>

      <div className="flex-1"></div>
      <div className="w-8 h-px bg-border-light my-1"></div>

      {/* Settings */}
      <button className="strip-btn" title="Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span className="text-[9px] font-medium leading-none">Settings</span>
      </button>

      <style jsx>{`
        /* ── Standard sidebar icon buttons ── */
        .strip-btn {
          width: 44px;
          height: 44px;
          border: none;
          background: transparent;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          gap: 2px;
          color: #5f6368;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .strip-btn:hover {
          background: #f1f3f4;
        }
        .strip-btn.active {
          color: #1a73e8;
        }

        /* ── Ask Maps button — pixel-perfect Google Maps reference ── */

        /*
          Gradient border trick:
          Outer button = gradient background (the border color)
          Inner .ask-maps-icon-wrap = white/light-blue fill clipped inside
          This gives a true gradient border without SVG hacks.
        */
        .ask-maps-btn {
          /* gradient border via background + padding */
          background: linear-gradient(135deg, #4a6cf7 0%, #3b82f6 40%, #60a5fa 100%);
          border: none;
          border-radius: 16px;
          padding: 2px;           /* this 2px becomes the border thickness */
          width: 46px;
          height: 46px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin: 5px 0 2px;
          box-shadow: 0 1px 4px rgba(59, 130, 246, 0.25);
          transition: box-shadow 0.18s, filter 0.18s;
          flex-shrink: 0;
          gap: 0;
        }
        .ask-maps-btn:hover {
          box-shadow: 0 3px 10px rgba(59, 130, 246, 0.38);
          filter: brightness(1.04);
        }
        .ask-maps-btn:active,
        .ask-maps-btn--active {
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.45);
          filter: brightness(0.97);
        }

        /* Inner rounded square — white/light-blue fill */
        .ask-maps-icon-wrap {
          width: 100%;
          height: 100%;
          border-radius: 14px;
          background: #eef3ff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding-top: 2px;
          transition: background 0.15s;
        }
        .ask-maps-btn:hover .ask-maps-icon-wrap {
          background: #e4edff;
        }
        .ask-maps-btn--active .ask-maps-icon-wrap {
          background: #dce8ff;
        }

        .ask-maps-label {
          font-size: 8.5px;
          font-weight: 500;
          color: #5f6368;
          line-height: 1;
          letter-spacing: 0.01em;
          white-space: nowrap;
          margin-top: 3px;
        }
      `}</style>
    </div>
  );
}
