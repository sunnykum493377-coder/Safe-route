import { useState, useRef, useEffect, useCallback } from 'react';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useVoiceSearch }    from '../hooks/useVoiceSearch';

// ─────────────────────────────────────────────────────────────────────────────
// Nominatim helpers
// ─────────────────────────────────────────────────────────────────────────────

function placeLabel(item) {
  const cls  = item.class || '';
  const type = item.type  || '';
  if (cls === 'aeroway' || type === 'aerodrome')              return { label: 'Airport',         icon: '✈️' };
  if (cls === 'railway')                                      return { label: 'Railway Station',  icon: '🚉' };
  if (cls === 'amenity' && type === 'bus_station')            return { label: 'Bus Station',      icon: '🚌' };
  if (cls === 'amenity' && type === 'university')             return { label: 'University',       icon: '🎓' };
  if (cls === 'amenity' && type === 'hospital')               return { label: 'Hospital',         icon: '🏥' };
  if (cls === 'amenity' && type === 'school')                 return { label: 'School',           icon: '🏫' };
  if (cls === 'amenity')                                      return { label: 'Amenity',          icon: '📌' };
  if (cls === 'tourism')                                      return { label: 'Landmark',         icon: '🗺️' };
  if (cls === 'historic')                                     return { label: 'Historic Site',    icon: '🏛️' };
  if (cls === 'natural')                                      return { label: 'Natural Feature',  icon: '🌿' };
  if (type === 'city' || type === 'town')                     return { label: 'City',             icon: '🏙️' };
  if (type === 'village' || type === 'hamlet')                return { label: 'Village',          icon: '🏘️' };
  if (type === 'suburb' || type === 'neighbourhood')          return { label: 'Neighbourhood',    icon: '🏡' };
  if (cls === 'boundary' && type === 'administrative')        return { label: 'Region',           icon: '📍' };
  if (cls === 'place')                                        return { label: 'Place',            icon: '📍' };
  if (cls === 'highway')                                      return { label: 'Road',             icon: '🛣️' };
  if (cls === 'shop')                                         return { label: 'Shop',             icon: '🛒' };
  return                                                             { label: 'Location',         icon: '📍' };
}

function parseName(item) {
  const addr = item.address || {};
  const primary =
    addr.aerodrome       || addr.railway_station || addr.station    ||
    addr.amenity         || addr.tourism          || addr.historic   ||
    addr.university      || addr.hospital         || addr.school     ||
    addr.road            || addr.suburb           || addr.neighbourhood ||
    addr.village         || addr.town             || addr.city       ||
    item.name            || item.display_name.split(',')[0];
  return {
    name:    primary,
    state:   addr.state   || addr.region  || '',
    country: addr.country || '',
  };
}

function toRecentEntry(item) {
  const { name, state, country } = parseName(item);
  const { label, icon }          = placeLabel(item);
  return {
    id:          `${item.place_id}-${Date.now()}`,
    displayName: item.display_name,
    name, state, country,
    typeLabel:   label,
    typeIcon:    icon,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Highlight matching text
// ─────────────────────────────────────────────────────────────────────────────

function Highlight({ text, query }) {
  if (!query?.trim()) return <span>{text}</span>;
  const q   = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark style={{ background: '#e8f0fe', color: '#1a73e8', borderRadius: '2px', padding: '0 1px', fontWeight: 700 }}>
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown shell
// ─────────────────────────────────────────────────────────────────────────────

function Dropdown({ listRef, children }) {
  return (
    <ul
      ref={listRef}
      role="listbox"
      style={{
        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
        background: '#fff', borderRadius: '14px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07)',
        border: '1px solid #e8eaed', zIndex: 9999,
        maxHeight: '300px', overflowY: 'auto',
        padding: '4px 0', margin: 0, listStyle: 'none',
        fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
      }}
    >
      {children}
    </ul>
  );
}

function SectionHeader({ label, actionLabel, onAction }) {
  return (
    <li style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 14px 4px', pointerEvents: 'none',
    }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#9aa0a6', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
      {actionLabel && (
        <button
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAction?.(); }}
          style={{ pointerEvents: 'all', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10.5px', color: '#1a73e8', fontWeight: 600, padding: '0 2px' }}
        >
          {actionLabel}
        </button>
      )}
    </li>
  );
}

function DropdownRow({ icon, name, sub, badge, isActive, isRecent, onSelect, onDelete, query }) {
  return (
    <li
      role="option"
      aria-selected={isActive}
      onMouseDown={(e) => { e.preventDefault(); onSelect(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '7px 12px 7px 14px', cursor: 'pointer',
        background: isActive ? '#f1f3f4' : 'transparent',
        transition: 'background 0.08s',
      }}
    >
      <span style={{
        width: '30px', height: '30px', borderRadius: '50%',
        background: isRecent ? '#f1f3f4' : '#e8f0fe',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', flexShrink: 0,
      }}>
        {icon}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', color: '#202124', fontWeight: 500, lineHeight: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {query ? <Highlight text={name} query={query} /> : name}
        </div>
        {sub && (
          <div style={{ fontSize: '11px', color: '#70757a', lineHeight: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
            {sub}
          </div>
        )}
      </div>

      {badge && (
        <span style={{
          flexShrink: 0, fontSize: '9.5px', fontWeight: 600,
          background: isRecent ? '#f1f3f4' : '#e8f0fe',
          color: isRecent ? '#70757a' : '#1a73e8',
          padding: '2px 7px', borderRadius: '10px', whiteSpace: 'nowrap',
        }}>
          {badge}
        </span>
      )}

      {isRecent && onDelete && (
        <button
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
          aria-label="Remove from history"
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: '#9aa0a6', display: 'flex', alignItems: 'center', borderRadius: '50%', lineHeight: 1 }}
          title="Remove"
        >
          <RemoveIcon />
        </button>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Voice listening overlay (inline, inside the input row)
// ─────────────────────────────────────────────────────────────────────────────

function ListeningBadge() {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
      pointerEvents: 'none', zIndex: 2,
    }}>
      {/* Three bouncing bars */}
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'inline-block', width: '3px', borderRadius: '2px',
          background: '#ea4335',
          animation: `voiceBar 0.9s ease-in-out ${i * 0.15}s infinite`,
          height: '14px',
        }} />
      ))}
      <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#ea4335', marginLeft: '2px', letterSpacing: '0.01em' }}>
        Listening…
      </span>
      <style>{`
        @keyframes voiceBar {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50%       { transform: scaleY(1.0); opacity: 1;   }
        }
      `}</style>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Error toast (auto-dismisses after 3.5 s)
// ─────────────────────────────────────────────────────────────────────────────

function ErrorToast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
      background: '#fce8e6', border: '1px solid #f5c6c2',
      borderRadius: '10px', padding: '8px 12px',
      display: 'flex', alignItems: 'center', gap: '8px',
      zIndex: 10000, boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
    }}>
      <span style={{ fontSize: '14px' }}>🎤</span>
      <span style={{ fontSize: '12px', color: '#c5221f', flex: 1 }}>{message}</span>
      <button
        onMouseDown={(e) => { e.preventDefault(); onDismiss(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c5221f', padding: '0 2px', fontSize: '14px', lineHeight: 1 }}
        aria-label="Dismiss"
      >×</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main LocationInput
// ─────────────────────────────────────────────────────────────────────────────

export default function LocationInput({
  value,
  onChange,
  onCommit,
  placeholder,
  inputClassName = '',
}) {
  const { recents, addRecent, removeRecent, clearRecents } = useRecentSearches();

  const [query,       setQuery]       = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const [mode,        setMode]        = useState('recents');
  // tracks whether current query text is interim voice (not yet committed)
  const [isInterim,   setIsInterim]   = useState(false);

  const debounceRef = useRef(null);
  const abortRef    = useRef(null);
  const wrapRef     = useRef(null);
  const inputRef    = useRef(null);
  const listRef     = useRef(null);

  const displayList = mode === 'recents' ? recents : suggestions;

  // ── Sync with parent (swap button etc.) ────────────────────────────────────
  useEffect(() => { setQuery(value || ''); }, [value]);

  // ── Outside click closes dropdown ──────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Scroll active item ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    listRef.current.children[activeIdx]?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // ── Fetch Nominatim suggestions ─────────────────────────────────────────────
  const fetchSuggestions = useCallback((q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current)    abortRef.current.abort();

    if (!q?.trim() || q.trim().length < 2) {
      setSuggestions([]); setMode('recents'); setLoading(false);
      setOpen(recents.length > 0);
      return;
    }

    setMode('suggestions'); setLoading(true);

    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${encodeURIComponent(q.trim())}` +
          `&format=json&limit=7&addressdetails=1&extratags=1&accept-language=en`;
        const data = await (await fetch(url, { signal: ctrl.signal, headers: { 'Accept-Language': 'en' } })).json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIdx(-1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSuggestions([]); setMode('recents'); setOpen(recents.length > 0);
        }
      } finally { setLoading(false); }
    }, 280);
  }, [recents.length]);

  // ── Commit a final selection ────────────────────────────────────────────────
  const commitSelection = useCallback((displayName, recentEntry) => {
    setQuery(displayName); onChange(displayName); onCommit?.(displayName);
    if (recentEntry) addRecent(recentEntry);
    setSuggestions([]); setOpen(false); setActiveIdx(-1); setIsInterim(false);
    inputRef.current?.blur();
  }, [onChange, onCommit, addRecent]);

  const selectSuggestion = useCallback((item) => {
    commitSelection(item.display_name, toRecentEntry(item));
  }, [commitSelection]);

  const selectRecent = useCallback((entry) => {
    addRecent(entry);
    setQuery(entry.displayName); onChange(entry.displayName); onCommit?.(entry.displayName);
    setSuggestions([]); setOpen(false); setActiveIdx(-1); setIsInterim(false);
    inputRef.current?.blur();
  }, [addRecent, onChange, onCommit]);

  // ── Voice search handlers ───────────────────────────────────────────────────
  const handleVoiceResult = useCallback((transcript, interim = false) => {
    setIsInterim(interim);
    setQuery(transcript);
    onChange(transcript);

    if (!interim) {
      // Final result — immediately fetch Nominatim suggestions
      fetchSuggestions(transcript);
      inputRef.current?.focus();
    }
  }, [onChange, fetchSuggestions]);

  const handleVoiceError = useCallback(() => {
    setIsInterim(false);
  }, []);

  const { voiceState, errorMsg, isSupported, start: startVoice, stop: stopVoice, clearError } =
    useVoiceSearch({ onResult: handleVoiceResult, onError: handleVoiceError });

  const isListening   = voiceState === 'listening';
  const isProcessing  = voiceState === 'processing';
  const showError     = voiceState === 'error' && !!errorMsg;

  const handleMicClick = (e) => {
    e.preventDefault();
    if (isListening) { stopVoice(); return; }
    startVoice();
  };

  // ── Typed input handlers ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v); onChange(v); setIsInterim(false);
    fetchSuggestions(v);
  };

  const handleFocus = () => {
    if (query.trim().length >= 2 && suggestions.length > 0) { setMode('suggestions'); setOpen(true); }
    else if (recents.length > 0) { setMode('recents'); setOpen(true); }
  };

  const handleKeyDown = (e) => {
    const total = displayList.length;
    if (!open || total === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, total - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        if (mode === 'suggestions' && suggestions[activeIdx]) selectSuggestion(suggestions[activeIdx]);
        else if (mode === 'recents' && recents[activeIdx]) selectRecent(recents[activeIdx]);
      } else { setOpen(false); }
    } else if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); }
  };

  const handleClear = (e) => {
    e.preventDefault();
    if (isListening) stopVoice();
    setQuery(''); onChange(''); setSuggestions([]); setMode('recents');
    setActiveIdx(-1); setIsInterim(false);
    setOpen(recents.length > 0);
    inputRef.current?.focus();
  };

  // ── Layout: right-side icons ────────────────────────────────────────────────
  // Slots from right: [clear/spinner] → [mic]
  // We offset each icon so they don't overlap inside the rounded pill.
  const hasClearOrSpinner = (query && !loading) || loading;
  const micRight  = hasClearOrSpinner ? '34px' : '10px';

  const showDropdown = open && (
    (mode === 'recents'     && recents.length > 0) ||
    (mode === 'suggestions' && suggestions.length > 0)
  );

  // Extra right padding on the input so text doesn't slide under the icons
  // mic (20px) + gap (4px) + clear (20px) + outer pad (10px) = ~54px max
  const inputPaddingRight = isSupported
    ? (hasClearOrSpinner ? '58px' : '36px')
    : (hasClearOrSpinner ? '36px' : '14px');

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      {/* ── Input row ── */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          className={inputClassName}
          placeholder={isListening ? '' : placeholder}
          value={isListening && isInterim ? query : query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
          style={{ paddingRight: inputPaddingRight }}
          readOnly={isListening}
        />

        {/* Listening animation overlay (sits above the input text) */}
        {isListening && <ListeningBadge />}

        {/* Mic button */}
        {isSupported && (
          <button
            onMouseDown={handleMicClick}
            aria-label={isListening ? 'Stop listening' : 'Voice search'}
            title={isListening ? 'Stop' : 'Search by voice'}
            style={{
              position:    'absolute',
              right:       micRight,
              top:         '50%',
              transform:   'translateY(-50%)',
              background:  isListening ? '#fce8e6' : 'none',
              border:      'none',
              cursor:      'pointer',
              padding:     '3px',
              display:     'flex',
              alignItems:  'center',
              borderRadius: '50%',
              transition:  'background 0.2s',
              zIndex:      2,
            }}
            tabIndex={-1}
          >
            <MicIcon active={isListening} processing={isProcessing} />
          </button>
        )}

        {/* Spinner (fetching Nominatim) */}
        {loading && !isListening && (
          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <SpinnerIcon />
          </span>
        )}

        {/* Clear button */}
        {query && !loading && !isListening && (
          <button
            onMouseDown={handleClear}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#9aa0a6', lineHeight: 1, display: 'flex', alignItems: 'center' }}
            tabIndex={-1}
            aria-label="Clear"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {/* ── Voice error toast ── */}
      {showError && <ErrorToast message={errorMsg} onDismiss={clearError} />}

      {/* ── Dropdown ── */}
      {showDropdown && (
        <Dropdown listRef={listRef}>
          {mode === 'recents' && (
            <>
              <SectionHeader label="Recent searches" actionLabel="Clear all" onAction={clearRecents} />
              {recents.map((entry, i) => (
                <DropdownRow
                  key={entry.id} icon="🕐"
                  name={entry.name}
                  sub={[entry.state, entry.country].filter(Boolean).join(', ')}
                  badge="Recent" isRecent isActive={i === activeIdx} query=""
                  onSelect={() => selectRecent(entry)}
                  onDelete={() => { removeRecent(entry.id); if (recents.length <= 1) setOpen(false); }}
                />
              ))}
            </>
          )}

          {mode === 'suggestions' && (
            <>
              <SectionHeader label="Suggestions" />
              {suggestions.map((item, i) => {
                const { name, state, country } = parseName(item);
                const { label, icon }          = placeLabel(item);
                return (
                  <DropdownRow
                    key={item.place_id} icon={icon}
                    name={name}
                    sub={[state, country].filter(Boolean).join(', ')}
                    badge={label} isRecent={false} isActive={i === activeIdx} query={query}
                    onSelect={() => selectSuggestion(item)}
                    onDelete={null}
                  />
                );
              })}
            </>
          )}
        </Dropdown>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

/** Mic icon — red + pulsing ring when active, grey when idle */
function MicIcon({ active, processing }) {
  return (
    <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
      {/* Pulse ring (visible only while listening) */}
      {active && (
        <span style={{
          position: 'absolute', inset: '-4px',
          borderRadius: '50%', border: '2px solid #ea4335',
          animation: 'micPulse 1s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`@keyframes micPulse { 0% { transform:scale(1); opacity:0.8; } 100% { transform:scale(1.7); opacity:0; } }`}</style>
        {/* Microphone body */}
        <rect x="9" y="2" width="6" height="11" rx="3"
          fill={active ? '#ea4335' : processing ? '#f9ab00' : '#70757a'} />
        {/* Arc + stand */}
        <path d="M5 11a7 7 0 0 0 14 0" stroke={active ? '#ea4335' : processing ? '#f9ab00' : '#70757a'} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <line x1="12" y1="18" x2="12" y2="21" stroke={active ? '#ea4335' : processing ? '#f9ab00' : '#70757a'} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="9"  y1="21" x2="15" y2="21" stroke={active ? '#ea4335' : processing ? '#f9ab00' : '#70757a'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="#dadce0" strokeWidth="2" />
      <path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" fill="#dadce0" />
      <path d="M4.5 4.5 L9.5 9.5 M9.5 4.5 L4.5 9.5" stroke="#5f6368" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 3.5 L10.5 10.5 M10.5 3.5 L3.5 10.5" stroke="#9aa0a6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
