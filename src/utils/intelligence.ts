import { PlanningRecommendation, PlanningRating, WeatherData, UnitSystem } from '../types';

export function formatTemp(celsius: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWind(kmh: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function generatePlanningRecommendations(
  weather: WeatherData,
  unit: UnitSystem
): PlanningRecommendation[] {
  const current = weather.current;
  const hourly = weather.hourly;
  const daily = weather.daily;

  const recommendations: PlanningRecommendation[] = [];

  // Helper to extract next 24h slices
  const nowIndex = 0; // standard hourly array starting point
  const next24Temps = hourly.temperature_2m.slice(nowIndex, nowIndex + 24);
  const next24PrecipProb = hourly.precipitation_probability.slice(nowIndex, nowIndex + 24);
  const next24Wind = hourly.wind_speed_10m.slice(nowIndex, nowIndex + 24);
  const next24Clouds = hourly.cloud_cover.slice(nowIndex, nowIndex + 24);
  const next24Uv = hourly.uv_index.slice(nowIndex, nowIndex + 24);
  const next24Times = hourly.time.slice(nowIndex, nowIndex + 24);

  // 1. OUTDOOR RUNNING & EXERCISE
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  const precip = current.precipitation;
  const humidity = current.relative_humidity_2m;

  let runRating: PlanningRating = 'good';
  let runSummary = 'Good conditions for outdoor fitness.';
  let runDetails = `Current temperature is ${formatTemp(temp, unit)} with wind at ${formatWind(wind, unit)}.`;
  const runActionables: string[] = [];

  if (precip > 1 || current.weather_code >= 61) {
    runRating = 'unfavorable';
    runSummary = 'Wet conditions: Rain expected.';
    runDetails = 'Rain or showers present. Indoor treadmill or workout recommended.';
    runActionables.push('Wear waterproof gear if running outdoors', 'Watch for slippery surfaces');
  } else if (temp < 0) {
    runRating = 'moderate';
    runSummary = 'Cold conditions: Freeze warning.';
    runDetails = 'Sub-zero temperatures. Layer up with thermal moisture-wicking clothes.';
    runActionables.push('Protect extremities (gloves, thermal beanie)', 'Warm up thoroughly indoors before starting');
  } else if (temp > 30) {
    runRating = 'unfavorable';
    runSummary = 'High heat stress: Danger of hyperthermia.';
    runDetails = 'Hot weather. Exercise in early morning or late evening hours.';
    runActionables.push('Hydrate with electrolytes before & after', 'Stick to shaded trails and wear light colors');
  } else if (temp >= 12 && temp <= 22 && wind < 20 && humidity < 75) {
    runRating = 'optimal';
    runSummary = 'Ideal running weather!';
    runDetails = 'Perfect balance of mild temperature, low humidity, and light breeze.';
    runActionables.push('Great time for long-distance training', 'Comfortable running tee & shorts ideal');
  } else {
    runRating = 'good';
    runSummary = 'Comfortable for outdoor workouts.';
    runActionables.push('Stay hydrated', 'Adjust pace based on local wind');
  }

  // Find best 3-hour window in next 24h for outdoor run
  let bestWindowStart = '';
  let bestScore = -999;
  for (let i = 6; i < 21 && i < next24Temps.length - 2; i++) {
    const avgTemp = (next24Temps[i] + next24Temps[i + 1] + next24Temps[i + 2]) / 3;
    const avgRain = (next24PrecipProb[i] + next24PrecipProb[i + 1] + next24PrecipProb[i + 2]) / 3;
    const avgW = (next24Wind[i] + next24Wind[i + 1] + next24Wind[i + 2]) / 3;

    // Ideal temp ~16C
    const tempScore = 100 - Math.abs(avgTemp - 16) * 5;
    const rainPenalty = avgRain * 1.5;
    const windPenalty = Math.max(0, avgW - 15) * 3;
    const score = tempScore - rainPenalty - windPenalty;

    if (score > bestScore) {
      bestScore = score;
      const hourStr = new Date(next24Times[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endHourStr = new Date(next24Times[i + 3]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      bestWindowStart = `${hourStr} – ${endHourStr}`;
    }
  }

  recommendations.push({
    id: 'running',
    title: 'Outdoor Running & Fitness',
    category: 'Activity',
    rating: runRating,
    summary: runSummary,
    details: runDetails,
    icon: 'Activity',
    optimalTimeWindow: bestWindowStart ? `Best window: ${bestWindowStart}` : undefined,
    actionables: runActionables,
  });

  // 2. LAUNDRY & OUTDOOR DRYING
  const dayRainMax = daily.precipitation_probability_max[0] || 0;
  const avg24Humidity = hourly.relative_humidity_2m.slice(0, 12).reduce((a, b) => a + b, 0) / 12;

  let laundryRating: PlanningRating = 'good';
  let laundrySummary = 'Drying laundry outdoors is feasible.';
  let laundryDetails = `Relative humidity is averaging ~${Math.round(avg24Humidity)}% with a ${dayRainMax}% chance of rain.`;
  const laundryActionables: string[] = [];

  if (dayRainMax > 50 || current.weather_code >= 51) {
    laundryRating = 'unfavorable';
    laundrySummary = 'High rain risk: Dry clothes indoors.';
    laundryDetails = 'Rain or high precipitation likelihood in the next 12 hours.';
    laundryActionables.push('Use indoor drying rack or machine tumble dryer', 'Avoid hanging heavy blankets outside');
  } else if (avg24Humidity < 50 && wind > 12 && temp > 18) {
    laundryRating = 'optimal';
    laundrySummary = 'Express outdoor drying conditions!';
    laundryDetails = 'Warm breeze and low humidity will dry clothes very quickly today.';
    laundryActionables.push('Securing garments with pegs recommended due to brisk breeze', 'Capitalize on morning sunshine');
  } else if (avg24Humidity > 80) {
    laundryRating = 'moderate';
    laundrySummary = 'Slow drying time due to damp air.';
    laundryDetails = 'High atmospheric humidity slows down water evaporation.';
    laundryActionables.push('Allow extra drying hours', 'Consider well-ventilated indoor space');
  } else {
    laundryActionables.push('Hang laundry early in the morning for maximum daylight warmth');
  }

  recommendations.push({
    id: 'laundry',
    title: 'Laundry & Outdoor Drying',
    category: 'Home',
    rating: laundryRating,
    summary: laundrySummary,
    details: laundryDetails,
    icon: 'Shirt',
    actionables: laundryActionables,
  });

  // 3. STARGAZING & NIGHT SKY
  let nightCloudAvg = 0;
  let nightHoursCount = 0;
  let nightWindow = '';

  for (let i = 0; i < next24Times.length; i++) {
    const d = new Date(next24Times[i]);
    const hr = d.getHours();
    if (hr >= 21 || hr <= 4) {
      nightCloudAvg += next24Clouds[i];
      nightHoursCount++;
      if (!nightWindow && next24Clouds[i] < 30) {
        nightWindow = `${d.toLocaleTimeString([], { hour: '2-digit' })} onwards`;
      }
    }
  }

  nightCloudAvg = nightHoursCount > 0 ? nightCloudAvg / nightHoursCount : 50;

  let starRating: PlanningRating = 'good';
  let starSummary = 'Fair stargazing conditions tonight.';
  let starDetails = `Expected night cloud cover averages around ${Math.round(nightCloudAvg)}%.`;
  const starActionables: string[] = [];

  if (nightCloudAvg < 20 && current.weather_code <= 3) {
    starRating = 'optimal';
    starSummary = 'Crystal clear night sky ahead!';
    starDetails = 'Minimal cloud obstruction and good atmospheric clarity.';
    starActionables.push('Great night for viewing constellations & planets', 'Bring a telescope or stargazing app');
  } else if (nightCloudAvg > 70 || current.weather_code >= 51) {
    starRating = 'unfavorable';
    starSummary = 'Poor stargazing: Dense clouds or rain.';
    starDetails = 'Thick cloud deck or precipitation obscuring celestial views.';
    starActionables.push('Plan stargazing for a clearer night', 'Check planetarium or virtual sky maps instead');
  } else {
    starRating = 'moderate';
    starSummary = 'Partial cloud cover tonight.';
    starActionables.push('Look for clear patches between moving clouds', 'Layer up for nighttime chill');
  }

  recommendations.push({
    id: 'stargazing',
    title: 'Stargazing & Astronomy',
    category: 'Nighttime',
    rating: starRating,
    summary: starSummary,
    details: starDetails,
    icon: 'Moon',
    optimalTimeWindow: nightWindow ? `Clear night window: ${nightWindow}` : undefined,
    actionables: starActionables,
  });

  // 4. UV & SUN PROTECTION
  const maxUv = daily.uv_index_max[0] || Math.max(...next24Uv);

  let uvRating: PlanningRating = 'good';
  let uvSummary = 'Moderate UV radiation level.';
  let uvDetails = `Peak UV index today reaches ${maxUv.toFixed(1)}.`;
  const uvActionables: string[] = [];

  if (maxUv >= 8) {
    uvRating = 'warning';
    uvSummary = 'Very High UV Warning!';
    uvDetails = `Dangerous UV index of ${maxUv.toFixed(1)}. Sunburn can occur in under 15 minutes.`;
    uvActionables.push(
      'Apply Broad Spectrum SPF 50+ sunscreen every 2 hours',
      'Wear UV400 sunglasses & wide-brim hat',
      'Avoid direct sun exposure between 11:00 AM – 3:00 PM'
    );
  } else if (maxUv >= 6) {
    uvRating = 'moderate';
    uvSummary = 'High UV Index: Protection recommended.';
    uvDetails = `UV index is ${maxUv.toFixed(1)}. Protection required during midday hours.`;
    uvActionables.push('Apply SPF 30+ sunscreen', 'Wear sunglasses and stay hydrated in shade');
  } else if (maxUv >= 3) {
    uvRating = 'good';
    uvSummary = 'Moderate UV: Basic sun care.';
    uvActionables.push('Wear sunglasses on sunny strolls', 'Apply light sunscreen if outdoors over an hour');
  } else {
    uvRating = 'optimal';
    uvSummary = 'Low UV Index: Minimal risk.';
    uvDetails = 'Safe outdoor sun levels. Sunscreen generally optional unless outdoors all day.';
    uvActionables.push('Great time for natural Vitamin D absorption');
  }

  recommendations.push({
    id: 'uv',
    title: 'UV & Sun Safety',
    category: 'Health',
    rating: uvRating,
    summary: uvSummary,
    details: uvDetails,
    icon: 'Sun',
    actionables: uvActionables,
  });

  // 5. COMMUTE & TRAVEL SAFETY
  const gusts = current.wind_gusts_10m || current.wind_speed_10m * 1.3;
  const visibilityMin = Math.min(...hourly.visibility.slice(0, 12)) / 1000; // in km

  let travelRating: PlanningRating = 'good';
  let travelSummary = 'Normal commute & driving conditions.';
  let travelDetails = `Visibility is good (~${Math.round(visibilityMin)} km) and wind gusts around ${formatWind(gusts, unit)}.`;
  const travelActionables: string[] = [];

  if (current.weather_code === 45 || current.weather_code === 48 || visibilityMin < 1) {
    travelRating = 'warning';
    travelSummary = 'Dense Fog Warning: Reduced visibility!';
    travelDetails = 'Thick fog present. Reduced reaction time and low roadway visibility.';
    travelActionables.push('Use low-beam headlights or fog lights', 'Increase safety distance between vehicles', 'Allow extra commute time');
  } else if (current.weather_code >= 95) {
    travelRating = 'warning';
    travelSummary = 'Thunderstorm Hazard: Heavy lightning & rain.';
    travelDetails = 'Severe storm activity. Danger of flash localized flooding and sudden wind gusts.';
    travelActionables.push('Postpone unnecessary highway driving', 'Beware of hydroplaning on pooled water');
  } else if (current.weather_code >= 71 || current.weather_code === 66 || current.weather_code === 67) {
    travelRating = 'warning';
    travelSummary = 'Icy Road Alert: Slippery conditions!';
    travelDetails = 'Freezing rain or accumulating snowfall on roads.';
    travelActionables.push('Drive at reduced speed', 'Check tire pressure and winter tread');
  } else if (gusts > 50) {
    travelRating = 'moderate';
    travelSummary = 'High Wind Gusts: Crosswind caution.';
    travelDetails = `Wind gusts up to ${formatWind(gusts, unit)} may sway high-profile vehicles.`;
    travelActionables.push('Firm grip on steering wheel on open bridges', 'Watch for falling tree branches');
  } else {
    travelActionables.push('Standard traffic rules apply', 'Check live navigation for typical traffic delays');
  }

  recommendations.push({
    id: 'commute',
    title: 'Commute & Travel Safety',
    category: 'Transit',
    rating: travelRating,
    summary: travelSummary,
    details: travelDetails,
    icon: 'Car',
    actionables: travelActionables,
  });

  // 6. OUTFIT & GEAR GUIDE
  const feelsLike = current.apparent_temperature;
  let outfitRating: PlanningRating = 'good';
  let outfitSummary = '';
  let outfitDetails = `Feels like ${formatTemp(feelsLike, unit)}.`;
  const outfitActionables: string[] = [];

  if (feelsLike < 0) {
    outfitSummary = 'Heavy Winter Attire';
    outfitActionables.push('Insulated down coat / heavy parka', 'Thermal base layer, gloves, scarf, & insulated boots', 'Beanie or ear warmers');
  } else if (feelsLike < 10) {
    outfitSummary = 'Warm Layers & Jacket';
    outfitActionables.push('Medium jacket or trench coat', 'Sweater / fleece mid-layer', 'Closed-toe shoes with warm socks');
  } else if (feelsLike < 20) {
    outfitSummary = 'Light Jacket or Cardigan';
    outfitActionables.push('Light hoodie, denim jacket, or pullover', 'Long pants / jeans', 'Sneakers');
  } else if (feelsLike < 28) {
    outfitSummary = 'Comfortable Summer Casual';
    outfitActionables.push('Short-sleeve shirt or breathable cotton tee', 'Shorts, skirt, or light trousers', 'Sunglasses');
  } else {
    outfitSummary = 'Lightweight & Breathable Clothing';
    outfitActionables.push('Ultra-light linen/cotton fabric', 'Sun hat and UV-blocking sunglasses', 'Open sandals or breathable mesh sneakers');
  }

  if (current.weather_code >= 51 && current.weather_code <= 82) {
    outfitActionables.push('Bring a compact umbrella or rain coat', 'Waterproof footwear');
  }

  recommendations.push({
    id: 'outfit',
    title: 'Outfit & Apparel Guide',
    category: 'Lifestyle',
    rating: outfitRating,
    summary: outfitSummary,
    details: outfitDetails,
    icon: 'Glasses',
    actionables: outfitActionables,
  });

  return recommendations;
}
