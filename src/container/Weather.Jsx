import "./Weather.css";
import { useEffect, useState } from "react";

function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("Chandigarh");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get weather using latitude and longitude
  const getWeather = async (latitude, longitude, cityName) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code&timezone=auto`
      );

      if (!response.ok) {
        throw new Error("Weather data could not be loaded");
      }

      const data = await response.json();

      setWeather(data);
      setCity(cityName);
    } catch (error) {
      console.error(error);
      setError("Unable to load weather.");
    } finally {
      setLoading(false);
    }
  };

  // Initial Chandigarh weather
  useEffect(() => {
    getWeather(30.7333, 76.7794, "Chandigarh");
  }, []);

  // Search city
  const searchCity = async (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          search
        )}&count=1&language=en&format=json`
      );

      const data = await response.json();
     console.log(data);
      if (!data.results || data.results.length === 0) {
        setError("City not found.");
        setLoading(false);
        return;
      }

      const location = data.results[0];

      await getWeather(
        location.latitude,
        location.longitude,
        location.name
      );

      setSearch("");
    } catch (error) {
      console.error(error);
      setError("Unable to find city.");
      setLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Get city name from coordinates
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
          );

          const location = await response.json();

          const cityName =
            location?.results?.[0]?.name || "Current Location";

          await getWeather(latitude, longitude, cityName);
        } catch (error) {
          console.error(error);
          await getWeather(latitude, longitude, "Current Location");
        }
      },
      () => {
        setError("Unable to get your location.");
        setLoading(false);
      }
    );
  };

  // Weather icon based on Open-Meteo weather code
  const getWeatherIcon = (code, time) => {
    const hour = new Date(time).getHours();

    const isNight = hour >= 19 || hour < 6;

    if (code === 0) {
      return isNight ? "🌙" : "☀️";
    }

    if (code === 1 || code === 2) {
      return isNight ? "🌙" : "🌤️";
    }

    if (code === 3) {
      return "☁️";
    }

    if ([45, 48].includes(code)) {
      return "🌫️";
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return "🌦️";
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
      return "🌧️";
    }

    if ([71, 73, 75, 77].includes(code)) {
      return "❄️";
    }

    if ([80, 81, 82].includes(code)) {
      return "🌦️";
    }

    if ([95, 96, 99].includes(code)) {
      return "⛈️";
    }

    return "🌤️";
  };

  // Weather text
  const getWeatherText = (code) => {
    if (code === 0) return "Clear sky";
    if ([1, 2].includes(code)) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55].includes(code)) return "Drizzle";
    if ([61, 63, 65].includes(code)) return "Rain";
    if ([71, 73, 75, 77].includes(code)) return "Snow";
    if ([80, 81, 82].includes(code)) return "Rain showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";

    return "Unknown";
  };

  // Current time period
  const getTimePeriod = () => {
    if (!weather?.current?.time) return "day";

    const hour = new Date(weather.current.time).getHours();

    if (hour >= 5 && hour < 11) {
      return "morning";
    }

    if (hour >= 11 && hour < 17) {
      return "day";
    }

    if (hour >= 17 && hour < 20) {
      return "evening";
    }

    return "night";
  };

  // Get hourly data closest to specific hour
  const getPeriodWeather = (startHour) => {
    if (!weather?.hourly) return null;

    const target = new Date(weather.current.time);
    target.setHours(startHour, 0, 0, 0);

    let closestIndex = 0;
    let smallestDifference = Infinity;

    weather.hourly.time.forEach((time, index) => {
      const difference = Math.abs(
        new Date(time).getTime() - target.getTime()
      );

      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestIndex = index;
      }
    });

    return {
      time: weather.hourly.time[closestIndex],
      temperature: weather.hourly.temperature_2m[closestIndex],
      humidity: weather.hourly.relative_humidity_2m[closestIndex],
      wind: weather.hourly.wind_speed_10m[closestIndex],
      rain: weather.hourly.precipitation_probability[closestIndex],
      code: weather.hourly.weather_code[closestIndex],
    };
  };

  if (loading && !weather) {
    return <h2 className="loading">Loading weather...</h2>;
  }

  if (!weather) {
    return <h2 className="loading">Loading...</h2>;
  }

  const timePeriod = getTimePeriod();

  const periods = [
    {
      name: "Morning",
      hour: 8,
      icon: "🌅",
    },
    {
      name: "Afternoon",
      hour: 14,
      icon: "☀️",
    },
    {
      name: "Evening",
      hour: 18,
      icon: "🌇",
    },
    {
      name: "Night",
      hour: 22,
      icon: "🌙",
    },
  ];

  return (
    <section className={`weather-section ${timePeriod}`}>
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="city-title">
          <span>📍</span>
          {city} Weather
        </div>

        <div className="actions">
          <button
            className="location-btn"
            onClick={getCurrentLocation}
            title="Use my location"
          >
            📍
          </button>

          <form onSubmit={searchCity} className="search-box">
            <input
              type="text"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit">🔍</button>
          </form>
        </div>
      </div>

      {/* ERROR */}
      {error && <p className="error">{error}</p>}

      {/* CURRENT WEATHER */}
      <div className="current-weather">
        <div className="current-left">
          <p className="temperature">
            {weather.current.temperature_2m}
            <span>°C</span>
          </p>

          <p className="condition">
            {getWeatherIcon(
              weather.current.weather_code,
              weather.current.time
            )}

            {getWeatherText(weather.current.weather_code)}
          </p>
        </div>

        <div className="current-details">
          <div>
            <span>💧</span>
            <p>
              Humidity
              <strong>
                {weather.current.relative_humidity_2m}%
              </strong>
            </p>
          </div>

          <div>
            <span>💨</span>
            <p>
              Wind
              <strong>
                {weather.current.wind_speed_10m} km/h
              </strong>
            </p>
          </div>

          <div>
            <span>☔</span>
            <p>
              Precipitation
              <strong>
                {weather.current.precipitation} mm
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* FORECAST */}
      <div className="forecast-section">
        <h2 className="forecast-title">Today's Forecast</h2>

        <div className="forecast">
          {periods.map((period) => {
            const data = getPeriodWeather(period.hour);

            if (!data) return null;

            return (
              <div className="day" key={period.name}>
                <p className="time">{period.name}</p>

                <h1 className="temp">
                  {Math.round(data.temperature)}°
                </h1>

                <div className="weather-icon">
                  {getWeatherIcon(data.code, data.time)}
                </div>

                <p className="forecast-condition">
                  {getWeatherText(data.code)}
                </p>

                <div className="forecast-info">
                  <p>💧 {data.humidity}%</p>
                  <p>💨 {data.wind} km/h</p>
                  <p>☔ {data.rain}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WeatherApp;