import React from 'react';
import WeatherCard from './WeatherCard';
import 'weather-icons/css/weather-icons.css';
import './WeatherPage.css';

const API_KEY = "53d81b0d0c74cce91d48f62434ea1b03";
const CITIES = [
  { name: 'Oslo', country: 'no' },
  { name: 'Bergen', country: 'no' },
  { name: 'Trondheim', country: 'no' },
  { name: 'Stavanger', country: 'no' },
  { name: 'Tromsø', apiName: 'Tromso', country: 'no' },
  { name: 'Kristiansand', country: 'no' },
  { name: 'Bodø', apiName: 'Bodo', country: 'no' },
  { name: 'Ålesund', apiName: 'Alesund', country: 'no' },
];

const WEATHER_ICONS = {
  Thunderstorm: 'wi-thunderstorm',
  Drizzle: 'wi-sleet',
  Rain: 'wi-storm-showers',
  Snow: 'wi-snow',
  Atmosphere: 'wi-fog',
  Clear: 'wi-day-sunny',
  Clouds: 'wi-day-cloudy',
};

const getWeatherIcon = (weatherId) => {
  if (weatherId >= 200 && weatherId <= 232) return WEATHER_ICONS.Thunderstorm;
  if (weatherId >= 300 && weatherId <= 321) return WEATHER_ICONS.Drizzle;
  if (weatherId >= 500 && weatherId <= 531) return WEATHER_ICONS.Rain;
  if (weatherId >= 600 && weatherId <= 622) return WEATHER_ICONS.Snow;
  if (weatherId >= 701 && weatherId <= 781) return WEATHER_ICONS.Atmosphere;
  if (weatherId === 800) return WEATHER_ICONS.Clear;
  if (weatherId >= 801 && weatherId <= 804) return WEATHER_ICONS.Clouds;
  return WEATHER_ICONS.Clouds;
};

const getIconType = (weatherId) => {
  if (weatherId >= 200 && weatherId <= 232) return 'thunderstorm';
  if (weatherId >= 300 && weatherId <= 321) return 'drizzle';
  if (weatherId >= 500 && weatherId <= 531) return 'rain';
  if (weatherId >= 600 && weatherId <= 622) return 'snow';
  if (weatherId >= 701 && weatherId <= 781) return 'atmosphere';
  if (weatherId === 800) return 'clear';
  return 'clouds';
};

class Weather extends React.Component {
  state = {
    cities: [],
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetchAllWeather();
  }

  fetchCityWeather = async (city) => {
    const query = city.apiName || city.name;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${query},${city.country}&appid=${API_KEY}`
    );
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    const weatherId = data.weather[0].id;
    return {
      name: city.name,
      temp: Math.floor(data.main.temp - 273.15),
      tempMin: Math.floor(data.main.temp_min - 273.15),
      tempMax: Math.floor(data.main.temp_max - 273.15),
      description: data.weather[0].description,
      icon: getWeatherIcon(weatherId),
      iconType: getIconType(weatherId),
    };
  };

  fetchAllWeather = async () => {
    this.setState({ loading: true, error: null });
    try {
      const results = await Promise.all(
        CITIES.map((city) => this.fetchCityWeather(city))
      );
      this.setState({ cities: results, loading: false });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  };

  render() {
    const { cities, loading, error } = this.state;

    if (loading) {
      return (
        <div className="weather-section">
          <h1 className="weather-title">Vremea în Norvegia</h1>
          <p className="weather-loading">Se încarcă datele meteo...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="weather-section">
          <h1 className="weather-title">Vremea în Norvegia</h1>
          <p className="weather-error">Eroare: {error}</p>
          <button onClick={this.fetchAllWeather} className="weather-retry-btn">
            Încearcă din nou
          </button>
        </div>
      );
    }

    return (
      <div className="weather-section">
        <h1 className="weather-title">Vremea în Norvegia</h1>
        <p className="weather-subtitle">Temperatura în principalele orașe</p>
        <div className="weather-grid">
          {cities.map((city) => (
            <WeatherCard key={city.name} {...city} />
          ))}
        </div>
        <button onClick={this.fetchAllWeather} className="weather-refresh-btn">
          Actualizează
        </button>
      </div>
    );
  }
}

export default Weather;
