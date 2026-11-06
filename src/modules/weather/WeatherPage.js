import {ui} from '../../languages/messages.js';
import React from 'react';
import WeatherCard from './WeatherCard';
import 'weather-icons/css/weather-icons.css';
import './WeatherPage.css';

const API_KEY = "53d81b0d0c74cce91d48f62434ea1b03";
const CITIES = [
  { name: ui('web_43152cc97f457f27'), country: 'no' },
  { name: ui('web_deae09060dcc8c1b'), country: 'no' },
  { name: 'Trondheim', country: 'no' },
  { name: ui('web_7da94aa07bf76227'), country: 'no' },
  { name: 'Tromsø', apiName: ui('web_9edfa4753032bb85'), country: 'no' },
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
  state = { cities: [], loading: true, error: null };

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
      const results = await Promise.all(CITIES.map((city) => this.fetchCityWeather(city)));
      this.setState({ cities: results, loading: false });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  };

  render() {
    const { cities, loading, error } = this.state;

    if (loading) {
      return (
        <div className="weather-page">
          <div className="weather-state">
            <span className="weather-state__icon" aria-hidden="true">☁</span>
            <h1>{ui('web_b9dcc9a309891712')}</h1>
            <p>{ui('web_19ac124b170f66b2')}</p>
            <span className="weather-state__loader" aria-hidden="true" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="weather-page">
          <div className="weather-state weather-state--error">
            <span className="weather-state__icon" aria-hidden="true">↻</span>
            <h1>{ui('web_1e9f4e3e0fdcd0fa')}</h1>
            <p>{ui('web_5f0f2748884e9448')}</p>
            <button onClick={this.fetchAllWeather} className="weather-retry-btn">{ui('web_a09d291920163176')}</button>
          </div>
        </div>
      );
    }

    const temperatures = cities.map((city) => city.temp);
    const lowestTemperature = Math.min(...temperatures);
    const highestTemperature = Math.max(...temperatures);
    const updatedAt = new Intl.DateTimeFormat('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    return (
      <main className="weather-page">
        <div className="weather-shell">
          <header className="weather-hero">
            <div className="weather-hero__copy">
              <span className="weather-eyebrow"><i />{ui('web_407be3974f241dd2')}</span>
              <h1>{ui('ui_9038c00a9eed701f')}</h1>
              <p>{ui('web_b4cbfe625d66d118')}</p>
            </div>
            <div className="weather-overview">
              <span>{ui('web_1619f95c9117ea79')}</span>
              <strong>{lowestTemperature}° <i>—</i> {highestTemperature}°</strong>
              <small>{ui('web_38b0eaff135b9b36')}{updatedAt}</small>
            </div>
          </header>

          <section className="weather-content" aria-labelledby="weather-cities-title">
            <div className="weather-heading">
              <div>
                <span>{ui('web_d8be2f5b4ebb38b1')}</span>
                <h2 id="weather-cities-title">{ui('web_ae105927a7d925b6')}</h2>
                <p>{ui('web_c287b0855dc35037')}</p>
              </div>
              <button onClick={this.fetchAllWeather} className="weather-refresh-btn">
                <span aria-hidden="true">↻</span>{ui('web_a7740735bc3b615b')}</button>
            </div>

            <div className="weather-grid">
              {cities.map((city) => <WeatherCard key={city.name} {...city} />)}
            </div>
          </section>

          <aside className="weather-advice">
            <span className="weather-advice__icon" aria-hidden="true">⌁</span>
            <div>
              <small>{ui('web_243f3e9d2a098c41')}</small>
              <h2>{ui('web_047292ef8d577ff4')}</h2>
              <p>{ui('web_f67aeea2a2ab3a3c')}</p>
            </div>
          </aside>
        </div>
      </main>
    );
  }
}

export default Weather;
