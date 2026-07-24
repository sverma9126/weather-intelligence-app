# Weather Intelligence Web Application

A clean, responsive, and feature-rich **Weather Intelligence Web Application** built with React, TypeScript, Tailwind CSS, and Recharts, styled with a modern **Geometric Balance** design system and powered by the **Open-Meteo Geocoding & Forecast APIs**.

![Weather Intelligence Application](https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Features

* **Global City Search**: Live debounced autocomplete searching for any city or region worldwide powered by the Open-Meteo Geocoding API.
* **GPS Geolocation Support**: One-click current location weather retrieval via standard browser Geolocation APIs and reverse geocoding.
* **Comprehensive Current Weather**:
  * Real-time temperature & "feels-like" values.
  * Daily High / Low temperature range.
  * Wind speed, direction, and wind gusts.
  * Relative humidity & dew point.
  * Barometric surface & sea-level pressure.
  * Visibility distance & cloud cover percentage.
  * Sunrise & sunset times customized to the local timezone.
* **24-Hour Timeline**: Scrollable hourly breakdown with metric tabs for Temperature, Precipitation Risk %, and Wind speed.
* **7-Day Weather Forecast**:
  * Detailed daily forecast cards.
  * Visual temperature spectrum bars displaying the position of each day's range within the weekly min/max range.
  * Expandable daily breakdown for sunrise, sunset, max UV index, wind gusts, and total rain volume.
* **Interactive Visual Analytics**: Interactive Recharts graphs with tabs for:
  1. *24-Hour Temperature & Feels-Like Curves*
  2. *Precipitation Probability Bar Chart*
  3. *Wind Speed & Gust Trends*
  4. *7-Day High vs. Low Comparison*
* **Smart Planning & Activity Intelligence**:
  * **Outdoor Running & Fitness**: Ideal temp/humidity/wind evaluation with recommended best 3-hour outdoor workout windows.
  * **Laundry & Outdoor Drying**: Drying speed assessment based on humidity, wind, and rain likelihood.
  * **Stargazing & Night Sky**: Cloud deck and night sky clarity rating for astronomy enthusiasts.
  * **UV & Sun Protection**: UV Index warnings and SPF/sunscreen/sunglasses guidelines.
  * **Commute & Driving Safety**: Fog, heavy rain, icy road, or thunderstorm hazards and driving tips.
  * **Outfit & Apparel Guide**: Tailored clothing layer suggestions based on real apparent temperature.
* **Unit Switching**: Seamless switching between Metric (°C, km/h, mm) and Imperial (°F, mph, inches) with automatic state persistence.
* **Favorites & Bookmarks**: Save favorite cities to `localStorage` for instant access through a slide-out drawer.
* **Error Handling**: Graceful fallback UI for non-existent cities, network failures, or location permission denials.

---

## 🌐 API Integrations

This application exclusively uses Open-Meteo's open, high-performance APIs without requiring external API keys:

1. **Open-Meteo Geocoding API**:
   * **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
   * **Purpose**: Resolves city names into latitude, longitude, country, state/province, and local timezones.

2. **Open-Meteo Forecast API**:
   * **Endpoint**: `https://api.open-meteo.com/v1/forecast`
   * **Purpose**: Fetches real-time weather metrics, 24-hour hourly timelines, and 7-day daily forecasts.

---

## 🚀 Local Development & Setup

### Prerequisites
* Node.js (v18 or higher recommended)
* npm, yarn, or pnpm

### Step-by-Step Setup

1. **Clone or Download the Repository**:
   ```bash
   git clone <repository-url>
   cd weather-intelligence-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

4. **Lint & Type Check**:
   ```bash
   npm run lint
   ```

---

## 🛠️ Production Build & Deployment

### Build Command
To compile and bundle the application for production:
```bash
npm run build
```
This produces optimized production static assets in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Deployment Options

#### 1. Cloud Run / Docker
The application includes Vite configuration bound to `0.0.0.0:3000` suitable for Cloud Run containers or standard Node.js Docker environments.

#### 2. Vercel or Netlify
Because this is a standard Vite React application with client-side API fetches, you can deploy the `dist` build output directly to Vercel, Netlify, or GitHub Pages.


## Cloudflare Pages Deployment

1. Connected GitHub repository `sverma9126/weather-intelligence-app` to Cloudflare Pages.
2. Build Configuration:
   - **Framework preset:** React (Vite)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Automatically deploys updates on every push to the `main` branch.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend Framework**: React 19 + TypeScript
* **Build Tool**: Vite 6
* **Styling**: Tailwind CSS v4
* **Charts & Data Visualization**: Recharts
* **Icons**: Lucide React
* **Animations**: Motion
