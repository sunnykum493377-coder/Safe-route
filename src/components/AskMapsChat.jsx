import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoSparkles } from 'react-icons/io5';
import { RiRobot2Line } from 'react-icons/ri';
import { FaUser } from 'react-icons/fa6';

// ─── Static mock responses ────────────────────────────────────────────────────
const MOCK_RESPONSES = {
  'find the safest route': `🛡️ **Safest Route Suggestion**\n\nBased on current safety data, I recommend:\n\n• **Route via NH-44** — low crime index, well-lit roads, patrolled stretch\n• Avoid sub-urban lanes after 9 PM\n• Real-time police patrol reported on this corridor\n\n✅ Safety score: 92/100`,

  'nearby hospitals': `🏥 **Nearby Hospitals**\n\n1. **Rajindra Hospital** — 2.1 km · 24/7 Emergency\n2. **Fortis Patiala** — 3.4 km · Trauma Centre\n3. **Ivy Hospital** — 5.0 km · Multi-specialty\n\n📞 Emergency: **112** | Ambulance: **108**`,

  'nearby police stations': `👮 **Nearby Police Stations**\n\n1. **Patiala Sadar** — 1.2 km · Open 24/7\n2. **Rajpura City Post** — 0.8 km\n3. **Model Town Chowki** — 2.5 km\n\n📞 Police Helpline: **100**\n🆘 Women Helpline: **1091**`,

  'petrol pumps': `⛽ **Nearby Petrol Pumps**\n\n1. **HP Petrol Pump** — 0.6 km · Open 24/7\n2. **Indian Oil, Leela Bhawan** — 1.1 km\n3. **BPCL, Sirhind Road** — 2.3 km\n\n💡 Tip: Pump #1 has CNG & EV charging available.`,

  'traffic updates': `🚦 **Live Traffic Updates**\n\n• **NH-44 (Rajpura → Patiala)** — Moderate congestion near Ghaggar bridge\n• **Sirhind Road** — Clear, good flow\n• **Bypass Road** — Roadwork between km 12–15, expect 8 min delay\n\n⏱️ Best travel window: 6–9 AM or after 8 PM`,

  'weather': `🌤️ **Current Weather**\n\n• **Temperature:** 32°C (feels like 36°C)\n• **Humidity:** 58%\n• **Wind:** 14 km/h SW\n• **Visibility:** 9.5 km\n• **UV Index:** 7 (High)\n\n⚠️ Carry water — heat index is elevated today.`,

  'flood alerts': `🌊 **Flood Alert Status**\n\n• **Ghaggar River** — Water level: Normal ✅\n• **Patiala-Ki-Rao** — Watch issued ⚠️ (level rising)\n• **Low-lying areas** near Rajpura — Advisory in effect\n\n📢 Avoid crossing water-logged areas. Stay tuned to IMD alerts.`,

  "women's safety": `🌸 **Women's Safety Info**\n\n• **Safest hours** to travel: 6 AM – 9 PM\n• Pink Booth active at: Bus Stand, Railway Station, Sector 11\n• **She-Taxi** available: Call 7888-88-4444\n• Night escort service: Contact Patiala Police — **100**\n\n🆘 Women Helpline: **1091** | Shakti App available on Play Store`,

  'night safety': `🌙 **Night Safety Tips**\n\n• Use well-lit, patrolled roads after 10 PM\n• Preferred route: NH-44 (CCTV covered)\n• Share live location with a trusted contact\n• Emergency SOS: Press power button 5× on Android\n\n👮 Night patrol active on: Mall Road, Leela Bhawan, Bus Stand area`,
};

const CHIPS = [
  { label: '🛡️ Find the safest route', key: 'find the safest route' },
  { label: '🏥 Nearby hospitals', key: 'nearby hospitals' },
  { label: '👮 Nearby police stations', key: 'nearby police stations' },
  { label: '⛽ Petrol pumps', key: 'petrol pumps' },
  { label: '🚦 Traffic updates', key: 'traffic updates' },
  { label: '🌤️ Weather', key: 'weather' },
  { label: '🌊 Flood alerts', key: 'flood alerts' },
  { label: "🌸 Women's safety", key: "women's safety" },
  { label: '🌙 Night safety', key: 'night safety' },
];

function getMockReply(input) {
  const lower = input.toLowerCase().trim();
  // Strip leading emoji + space for chip label matching
  const stripped = lower.replace(/^[\p{Emoji}\s]+/u, '').trim();
  for (const key of Object.keys(MOCK_RESPONSES)) {
    if (lower.includes(key) || stripped.includes(key)) return MOCK_RESPONSES[key];
  }
  return `🤖 I received your message: **"${input}"**\n\nI can help you with:\n• Safest routes & traffic\n• Nearby hospitals, police stations, petrol pumps\n• Weather & flood alerts\n• Women's safety & night safety\n\nTry one of the suggested chips below!`;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex gap-2 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${
          isUser ? 'bg-google-blue text-white' : 'bg-gradient-to-br from-[#1a73e8] to-[#6c4de8] text-white'
        }`}
      >
        {isUser ? <FaUser size={11} /> : <RiRobot2Line size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
          isUser
            ? 'bg-google-blue text-white rounded-br-sm'
            : 'bg-white text-text-primary border border-border-light rounded-bl-sm'
        }`}
        style={{ wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{
          __html: msg.text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>'),
        }}
      />
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex gap-2 items-end"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#6c4de8] flex items-center justify-center flex-shrink-0">
        <RiRobot2Line size={14} className="text-white" />
      </div>
      <div className="bg-white border border-border-light px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-text-tertiary"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function AskMapsChat({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'ai',
      text: "👋 Hi! I'm your **AI Travel Assistant**.\n\nAsk me anything about routes, safety, weather, hospitals, or nearby places. You can also tap a suggestion below!",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 350);
  }, []);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI thinking delay (800–1400 ms)
    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      const reply = getMockReply(trimmed);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }]);
      setTyping(false);
    }, delay);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <motion.div
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="absolute top-0 left-0 h-full w-[380px] min-w-[340px] bg-[#f8f9fa] flex flex-col shadow-2xl z-30"
      style={{ borderRight: '1px solid #e8eaed' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-border-light flex-shrink-0 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a73e8] to-[#6c4de8] flex items-center justify-center shadow-md">
          <IoSparkles size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-text-primary leading-tight">Ask Maps</h2>
          <p className="text-[11px] text-text-tertiary leading-tight">Your AI Travel Assistant</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:bg-bg-gray hover:text-text-primary transition-colors"
          title="Close"
        >
          <IoClose size={18} />
        </button>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 custom-scrollbar">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Suggested chips ── */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 custom-scrollbar"
        style={{ scrollbarWidth: 'none' }}>
        {CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => sendMessage(chip.label)}
            disabled={typing}
            className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-border-medium text-text-secondary hover:bg-google-blue-light hover:text-google-blue hover:border-google-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Input row ── */}
      <div className="px-3 pb-4 pt-2 flex-shrink-0 bg-[#f8f9fa]">
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-border-medium px-3 py-2 shadow-sm focus-within:border-google-blue focus-within:shadow-[0_0_0_2px_rgba(26,115,232,0.15)] transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about routes, safety, weather…"
            disabled={typing}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-quaternary outline-none disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            className="w-8 h-8 rounded-full bg-google-blue flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-google-blue-dark transition-colors flex-shrink-0"
          >
            <IoSend size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
