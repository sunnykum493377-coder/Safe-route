export function fmtDist(m) {
  return m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.round(m) + ' m';
}

export function fmtTime(sec, factor) {
  const s = Math.round(sec * factor);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? h + 'h ' + (m > 0 ? m + 'm' : '') : m + ' min';
}

export function toMins(str) {
  let t = 0;
  const h = str.match(/(\d+)h/);
  if (h) t += +h[1] * 60;
  const m = str.match(/(\d+)\s*min/);
  if (m) t += +m[1];
  return t || 1;
}

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const r = Math.PI / 180;
  const dlat = (lat2 - lat1) * r;
  const dlon = (lon2 - lon1) * r;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dlon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function scoreColor(score) {
  if (score >= 90) return '#137333';
  if (score >= 70) return '#b06000';
  if (score >= 50) return '#e65100';
  return '#c5221f';
}

export function aqiInfo(value) {
  if (value <= 20) return { lbl: 'Good', cls: 'p-good', color: '#137333' };
  if (value <= 40) return { lbl: 'Fair', cls: 'p-good', color: '#137333' };
  if (value <= 60) return { lbl: 'Moderate', cls: 'p-moderate', color: '#b06000' };
  if (value <= 80) return { lbl: 'Poor', cls: 'p-poor', color: '#e65100' };
  if (value <= 100) return { lbl: 'Very Poor', cls: 'p-hot', color: '#c5221f' };
  return { lbl: 'Hazardous', cls: 'p-hot', color: '#7b0000' };
}

export function tempInfo(temp) {
  if (temp < 10) return { lbl: 'Cold', cls: 'p-cool' };
  if (temp < 20) return { lbl: 'Cool', cls: 'p-cool' };
  if (temp < 28) return { lbl: 'Pleasant', cls: 'p-pleasant' };
  if (temp < 35) return { lbl: 'Warm', cls: 'p-warm' };
  return { lbl: 'Hot', cls: 'p-hot' };
}

export function wmoLabel(code) {
  if (code === 0) return 'Clear Sky';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Rain Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function wmoIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 49) return '🌫️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

export function windDir(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function uvLabel(uv) {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

export function calcScore(aqi, temp) {
  let score = 100;
  if (aqi > 100) score -= 30;
  else if (aqi > 60) score -= 15;
  else if (aqi > 40) score -= 5;

  if (temp > 40) score -= 20;
  else if (temp > 35) score -= 10;
  else if (temp < 10) score -= 8;

  return Math.max(10, Math.min(100, Math.round(score)));
}
