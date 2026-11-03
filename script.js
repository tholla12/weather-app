// Weather App
// Uses the free Open-Meteo API (no account or API key needed):
//   1. Geocoding API turns a city name into latitude and longitude.
//   2. Forecast API returns the weather for those coordinates.

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// Open-Meteo describes the weather with a numeric code. This maps codes to words.
const WEATHER_CODES = {
  0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  56: 'Freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail'
};

// Grab the page elements we need
const form = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const unitToggle = document.getElementById('unitToggle');
const searchButton = form.querySelector('button');

// App state: the latest data and the selected unit
let weatherData = null;
let placeName = '';
let useFahrenheit = false;

// ---------- Helpers ----------
function describe(code) {
  return WEATHER_CODES[code] || 'Unknown';
}

function toDisplayTemp(celsius) {
  const value = useFahrenheit ? celsius * 9 / 5 + 32 : celsius;
  return `${Math.round(value)}°${useFahrenheit ? 'F' : 'C'}`;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

// ---------- Talking to the API ----------
async function findCity(name) {
  const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not look up that city. Please try again.');
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No city found for "${name}". Check the spelling and try again.`);
  }
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: 5
  });
  const response = await fetch(`${FORECAST_URL}?${params}`);
  if (!response.ok) throw new Error('Could not load the weather. Please try again.');
  return response.json();
}

// ---------- Showing the data ----------
function render() {
  if (!weatherData) return;
  const { current, daily } = weatherData;

  document.getElementById('place').textContent = placeName;
  document.getElementById('temp').textContent = toDisplayTemp(current.temperature_2m);
  document.getElementById('summary').textContent = describe(current.weather_code);
  document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('wind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;

  const list = document.getElementById('forecast');
  list.innerHTML = '';

  daily.time.forEach((dateString, i) => {
    // Adding T12:00 avoids the date shifting by a day because of time zones
    const day = new Date(`${dateString}T12:00:00`).toLocaleDateString('en', { weekday: 'short' });

    const item = document.createElement('li');
    item.innerHTML = `
      <p class="day">${i === 0 ? 'Today' : day}</p>
      <p class="desc">${describe(daily.weather_code[i])}</p>
      <p class="range">${toDisplayTemp(daily.temperature_2m_max[i])} <span>${toDisplayTemp(daily.temperature_2m_min[i])}</span></p>
    `;
    list.appendChild(item);
  });

  unitToggle.textContent = useFahrenheit ? 'Switch to °C' : 'Switch to °F';
  resultEl.hidden = false;
}

// ---------- Events ----------
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    setStatus('Please type a city name.', true);
    resultEl.hidden = true;
    return;
  }

  setStatus('Loading...');
  searchButton.disabled = true;

  try {
    const place = await findCity(city);
    weatherData = await getWeather(place.latitude, place.longitude);
    placeName = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
    setStatus('');
    render();
  } catch (error) {
    resultEl.hidden = true;
    // fetch() throws a TypeError when the network is down
    const offline = error instanceof TypeError;
    setStatus(offline ? 'Network problem. Check your internet connection.' : error.message, true);
  } finally {
    searchButton.disabled = false;
  }
});

unitToggle.addEventListener('click', () => {
  useFahrenheit = !useFahrenheit;
  render();
});
