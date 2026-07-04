# 🚀 Quick Start Guide

Get ShieldRoute up and running in under 5 minutes!

## Step 1: Prerequisites

Make sure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v6 or higher
```

## Step 2: Installation

```bash
# Navigate to the project directory
cd Safe-route

# Install dependencies
npm install
```

This will install all required packages including React, Vite, Tailwind CSS, and Leaflet.

## Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v8.1.3  ready in 577 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 4: Open in Browser

Open your browser and go to: **http://localhost:5173**

## Step 5: Try It Out!

1. **Enter locations** in the search boxes (e.g., "Rajpura, Punjab" → "Patiala, Punjab")
2. **Select transport mode** (Car, Bike, Bus, or Walk)
3. **Click "Get Routes"** to fetch route options
4. **Compare routes** based on distance, time, weather, and AQI
5. **Select a route** and start navigation

## 🎯 First-Time Tips

### Using the App

- **Swap locations**: Click the ⇅ button between inputs
- **Change view**: Use map controls (zoom, locate)
- **Route comparison**: Each route card shows:
  - 📏 Distance and time
  - 🌤️ Weather conditions
  - 💨 Air quality (AQI)
  - ⭐ Overall safety score

### Navigation Features

- **Start navigation**: Click "Select This Route" on any route card
- **GPS tracking**: Allows location access for real-time tracking
- **Progress bar**: Shows your journey progress
- **Stop navigation**: Click the red "Stop Navigation" button

## 🔧 Common Issues & Solutions

### Port Already in Use

If port 5173 is busy:
```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Or specify a different port
npm run dev -- --port 3000
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Map Not Loading

- Check your internet connection (APIs require internet)
- Clear browser cache
- Try a different browser
- Check browser console for errors (F12)

### Location Not Found

- Use specific locations (e.g., "Patiala, Punjab" not just "Patiala")
- Try major cities first
- Check spelling

## 📱 Mobile Testing

To test on your phone:

1. Find your computer's local IP:
```bash
# On Mac/Linux:
ifconfig | grep "inet "

# On Windows:
ipconfig
```

2. Start server with network access:
```bash
npm run dev -- --host
```

3. On your phone, open: `http://YOUR_IP:5173`

## 🏗️ Building for Production

When ready to deploy:

```bash
npm run build
```

This creates optimized files in the `dist` folder.

Preview the production build:
```bash
npm run preview
```

## 📚 Next Steps

- **Read the full [README.md](./README.md)** for detailed features
- **Check [DEPLOYMENT.md](./DEPLOYMENT.md)** for deployment options
- **Review [CHANGELOG.md](./CHANGELOG.md)** for version history
- **Explore the code** in the `src` folder

## 🎨 Customization

### Change Default Locations

Edit `src/App.jsx`:
```jsx
const [source, setSource] = useState('Your City');
const [destination, setDestination] = useState('Destination');
```

### Modify Colors

Edit `tailwind.config.js`:
```js
colors: {
  google: {
    blue: '#1a73e8', // Change this
  }
}
```

### Add Features

1. Create new component in `src/components/`
2. Import in `App.jsx`
3. Add to the render tree

## 🐛 Reporting Issues

If you encounter problems:

1. Check the browser console (F12 → Console tab)
2. Check the terminal for errors
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Browser and OS info

## 💡 Pro Tips

- **Hot Reload**: Edit files while server runs - changes appear instantly
- **React DevTools**: Install browser extension for debugging
- **Code Organization**: Components in `components/`, APIs in `services/`
- **Styling**: Use Tailwind classes - check [tailwindcss.com](https://tailwindcss.com)

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Leaflet Docs](https://leafletjs.com)
- [React-Leaflet](https://react-leaflet.js.org)

## ✨ You're All Set!

Your ShieldRoute app is now running. Start exploring routes and building features!

Need help? Check the documentation or open an issue on GitHub.

Happy coding! 🚀
