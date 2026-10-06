import React from 'react';

const WeatherCard = ({ name, temp, tempMin, tempMax, description, icon, iconType = 'clouds' }) => {
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <article className={`weather-card weather-card--${iconType}`}>
      <header className="weather-card__header">
        <div>
          <span className="weather-card__status"><i /> Acum</span>
          <h3 className="weather-card__city">{name}</h3>
        </div>
        <div className={`weather-card__icon weather-card__icon--${iconType}`} aria-hidden="true">
          <i className={`wi ${icon}`} />
        </div>
      </header>

      <div className="weather-card__reading">
        <p className="weather-card__temp">{temp}<span>°C</span></p>
        <p className="weather-card__desc">{capitalize(description)}</p>
      </div>

      <footer className="weather-card__range" aria-label={`Temperaturi pentru ${name}`}>
        <span><small>Minimă</small><strong>{tempMin}°</strong></span>
        <span><small>Maximă</small><strong>{tempMax}°</strong></span>
      </footer>
    </article>
  );
};

export default WeatherCard;
