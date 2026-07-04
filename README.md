# 🛡️ ShieldRoute - Smart Route Planner

A modern, intelligent route planning application that helps you find the best routes based on multiple factors including distance, travel time, weather conditions, and air quality index (AQI).

## ✨ Features

- **Multiple Route Options**: Get up to 3 alternative routes with detailed comparisons
- **Weather Integration**: Real-time weather data including temperature, humidity, wind, visibility, and UV index
- **Air Quality Monitoring**: European AQI scale with PM2.5 and PM10 measurements
- **Smart Scoring System**: Routes are scored based on distance, time, weather, and air quality
- **Multiple Transport Modes**: Support for car, bike, bus, and walking
- **Interactive Map**: Powered by Leaflet and OpenStreetMap
- **GPS Navigation**: Real-time navigation with progress tracking
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Maps**: Leaflet + React-Leaflet
- **APIs Used**:
  - OpenStreetMap (Nominatim) for geocoding
  - OSRM for routing
  - Open-Meteo for weather data
  - Open-Meteo Air Quality API for AQI data

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/sunnykum493377-coder/Safe-route.git
cd Safe-route
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
Safe-route/
├── src/
│   ├── components/          # React components
│   │   ├── AlertBanner.jsx  # High AQI alert banner
│   │   ├── InfoBar.jsx      # Route count and status info
│   │   ├── LeftStrip.jsx    # Left navigation strip
│   │   ├── Map.jsx          # Interactive map component
│   │   ├── NavigationPanel.jsx  # Navigation controls
│   │   ├── RouteCard.jsx    # Individual route card with details
│   │   ├── SearchSection.jsx   # Search inputs and transport tabs
│   │   ├── Sidebar.jsx      # Main sidebar container
│   │   └── Skeleton.jsx     # Loading skeleton
│   ├── services/
│   │   └── api.js           # API integration functions
│   ├── utils/
│   │   ├── constants.js     # App constants
│   │   └── helpers.js       # Utility functions
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── vite.config.js          # Vite configuration
```

## 🎯 Usage

1. **Enter Locations**: Type your starting point and destination in the search boxes
2. **Select Transport Mode**: Choose between car, bike, bus, or walking
3. **Get Routes**: Click "Get Routes" to fetch available routes
4. **Compare Options**: Review the route cards showing:
   - Distance and travel time
   - Weather conditions
   - Air quality index
   - Overall safety score
5. **Select a Route**: Click on a route card or the "Select This Route" button
6. **Start Navigation**: Click the button to begin GPS navigation

## 🌤️ Weather & AQI Information

### Weather Data Includes:
- Temperature (°C) and "feels like" temperature
- Weather condition (clear, cloudy, rain, etc.)
- Humidity percentage
- Wind speed and direction
- Visibility in kilometers
- Atmospheric pressure
- UV index

### Air Quality Index (AQI):
- European AQI scale (0-100+)
- Classifications: Good, Fair, Moderate, Poor, Very Poor, Hazardous
- PM2.5 and PM10 measurements
- Visual gauge representation

## 🎨 Customization

The app uses Tailwind CSS for styling. You can customize the theme in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      google: {
        blue: '#1a73e8',
        // ... more colors
      }
    }
  }
}
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

### Code Structure

The app follows a component-based architecture:
- **Presentational Components**: Focus on UI rendering
- **Container Components**: Handle state and logic
- **Service Layer**: API calls and data fetching
- **Utility Functions**: Reusable helper functions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- OpenStreetMap contributors
- Open-Meteo API
- OSRM Project
- Leaflet library
- React and Vite teams

## 📞 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ by the ShieldRoute team
