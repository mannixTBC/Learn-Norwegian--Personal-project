import React from 'react';

const WeatherCard = ({ name, temp, tempMin, tempMax, description, icon, iconType = 'clouds' }) => {
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <div className="weather-card">
      <h3 className="weather-card__city">{name}</h3>
      <div className={`weather-card__icon weather-card__icon--${iconType}`}>
        <i className={`wi ${icon}`} />
      </div>
      <p className="weather-card__temp">{temp}°C</p>
      <p className="weather-card__range">
        {tempMin}° / {tempMax}°
      </p>
      <p className="weather-card__desc">{capitalize(description)}</p>
    </div>
  );
};

export default WeatherCard;
