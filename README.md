# Weather App

Search for any city and see the current weather and a 5-day forecast. Built to practise working with APIs in JavaScript.

**Live demo:** https://tholla12.github.io/weather-app/

## Features

- Search by city name
- Current temperature, conditions, humidity and wind speed
- 5-day forecast
- Switch between Celsius and Fahrenheit
- Clear messages for empty searches, unknown cities, loading and network errors
- Responsive layout that works on phones and desktops

## Built with

HTML, CSS and JavaScript (fetch, async/await). Data comes from the free [Open-Meteo API](https://open-meteo.com/), which needs no API key.

## Run it locally

1. Download or clone this repository.
2. Open `index.html` in your browser.

## What I learned

- Making API requests with `fetch` and `async/await`
- Chaining two API calls (city name to coordinates, then coordinates to weather)
- Handling errors so the user always knows what went wrong
- Updating the page from data using the DOM

## Possible improvements

- Remember the last searched city with localStorage
- Add hourly forecasts
- Detect the user's location
