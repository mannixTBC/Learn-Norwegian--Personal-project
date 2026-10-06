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
            <h1>Pregătim vremea din Norvegia</h1>
            <p>Se încarcă cele mai recente date meteo...</p>
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
            <h1>Vremea nu a putut fi încărcată</h1>
            <p>Conexiunea cu serviciul meteo a fost întreruptă. Poți încerca din nou.</p>
            <button onClick={this.fetchAllWeather} className="weather-retry-btn">
              Încearcă din nou
            </button>
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
              <span className="weather-eyebrow"><i /> Date meteo actuale</span>
              <h1>Vremea în Norvegia</h1>
              <p>O privire rapidă asupra condițiilor din principalele orașe, ca să îți poți planifica ziua mai ușor.</p>
            </div>
            <div className="weather-overview">
              <span>Intervalul de astăzi</span>
              <strong>{lowestTemperature}° <i>—</i> {highestTemperature}°</strong>
              <small>Actualizat la {updatedAt}</small>
            </div>
          </header>

          <section className="weather-content" aria-labelledby="weather-cities-title">
            <div className="weather-heading">
              <div>
                <span>8 orașe urmărite</span>
                <h2 id="weather-cities-title">Cum este vremea acum</h2>
                <p>Temperaturi și condiții meteo actualizate pentru orașele principale.</p>
              </div>
              <button onClick={this.fetchAllWeather} className="weather-refresh-btn">
                <span aria-hidden="true">↻</span> Actualizează
              </button>
            </div>

            <div className="weather-grid">
              {cities.map((city) => <WeatherCard key={city.name} {...city} />)}
            </div>
          </section>

          <aside className="weather-advice">
            <span className="weather-advice__icon" aria-hidden="true">⌁</span>
            <div>
              <small>Bine de știut</small>
              <h2>Vremea se poate schimba repede</h2>
              <p>Mai ales pe coastă și la munte, ia cu tine un strat impermeabil chiar dacă ziua începe senin.</p>
            </div>
          </aside>
        </div>
      </main>
    );
  }
}

export default Weather;
