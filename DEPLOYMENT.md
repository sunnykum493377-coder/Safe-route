# 🚀 Deployment Guide

This guide covers deploying ShieldRoute to various platforms.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## Deployment Options

### 1. Vercel (Recommended)

Vercel offers the easiest deployment for Vite + React apps.

#### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Method 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect Vite configuration
6. Click "Deploy"

**Vercel Configuration** (if needed):
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2. Netlify

#### Method 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Method 2: Drag and Drop

1. Build your project: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to Netlify's deploy zone

#### Method 3: GitHub Integration

1. Push to GitHub
2. Connect repository on Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

**netlify.toml** (optional):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Update `vite.config.js`:
```js
export default defineConfig({
  plugins: [react()],
  base: '/Safe-route/', // Replace with your repo name
})
```

3. Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages in repository settings

### 4. Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Deploy:
```bash
railway up
```

### 5. Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new "Static Site"
4. Connect GitHub repository
5. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

### 6. Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```

3. Configure `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

4. Build and deploy:
```bash
npm run build
firebase deploy
```

### 7. AWS Amplify

1. Install Amplify CLI:
```bash
npm install -g @aws-amplify/cli
```

2. Initialize:
```bash
amplify init
```

3. Add hosting:
```bash
amplify add hosting
```

4. Deploy:
```bash
amplify publish
```

### 8. Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t shieldroute .
docker run -p 80:80 shieldroute
```

## Environment Variables

If you need to add environment variables:

1. Create `.env` file:
```env
VITE_API_KEY=your_api_key
```

2. Access in code:
```js
const apiKey = import.meta.env.VITE_API_KEY;
```

3. Add to deployment platform's environment settings

## Post-Deployment Checklist

- [ ] Test all routes and navigation
- [ ] Verify map loads correctly
- [ ] Check weather and AQI data fetching
- [ ] Test on mobile devices
- [ ] Verify GPS functionality (HTTPS required)
- [ ] Check console for errors
- [ ] Test all transport modes
- [ ] Verify route calculations

## Performance Optimization

Already implemented:
- ✅ Code splitting with Vite
- ✅ Tree shaking
- ✅ Minification
- ✅ CSS optimization with Tailwind
- ✅ Lazy loading of routes

Optional improvements:
- Add service worker for offline support
- Implement route caching
- Add image optimization
- Use CDN for static assets

## Troubleshooting

### Map not showing
- Check if Leaflet CSS is imported
- Verify API endpoints are accessible
- Check browser console for errors

### GPS not working
- Ensure site is served over HTTPS
- Check browser permissions
- Test location API access

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Domain Setup

After deployment, you can add a custom domain:

1. **Vercel/Netlify**: Add domain in dashboard
2. **GitHub Pages**: Add CNAME file to `public` directory
3. **Other platforms**: Follow platform-specific instructions

## Monitoring

Consider adding:
- Google Analytics
- Sentry for error tracking
- Performance monitoring tools
- Uptime monitoring

---

For questions or issues, please open a GitHub issue.
