export async function geocode(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await response.json();
  if (!data.length) {
    throw new Error(`Location not found: "${query}"`);
  }
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

export async function fetchOSRM(source, dest) {
  const url = `https://router.project-osrm.org/route/v1/driving/${source[1]},${source[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson&alternatives=true`;
  const response = await fetch(url);
  const json = await response.json();
  
  if (json.code !== 'Ok') {
    throw new Error('Could not find road route between these locations');
  }
  
  return json.routes.map(route => ({
    coords: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
    distM: route.distance,
    durS: route.duration
  }));
}

export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&hourly=uv_index&forecast_days=1&timezone=auto`;
  const response = await fetch(url);
  const data = await response.json();
  const current = data.current;
  const uv = Math.max(...(data.hourly?.uv_index?.slice(0, 12) || [0]));
  
  return {
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    windDeg: Math.round(current.wind_direction_10m || 0),
    pressure: Math.round(current.surface_pressure),
    vis: +((current.visibility || 0) / 1000).toFixed(1),
    code: current.weather_code,
    uv: Math.round(uv)
  };
}

export async function fetchAQI(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10&timezone=auto`;
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    aqi: Math.round(data.current?.european_aqi || 0),
    pm25: +(data.current?.pm2_5 || 0).toFixed(1),
    pm10: +(data.current?.pm10 || 0).toFixed(1)
  };
}
