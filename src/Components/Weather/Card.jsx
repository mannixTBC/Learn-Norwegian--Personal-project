import React from 'react';
import './weatherCard.css';



const WeatherCard = (props) => {
    return(
        <div className="container border border-primary card" style={{width:`15rem`}}>
            <div className="cards">
                    <h1 className="text-center">{props.city}</h1>
                    <h2 className="text-center">{props.choseCity}</h2>
                  
                    <h5 className="py-1 text-center">
                        <i class={`wi ${props.wheatherIcon} display-1`}></i>
                    </h5>
                     <h1 className="py-2 text-center">{props.temp_celsius}&deg;</h1>
                     <h1 className="text-center">{minMaxTemp(props.temp_min,props.temp_max)}</h1>
                    <h4 className="py-3 text-center">{props.description}</h4>
            </div>
        </div>
    )
}

const minMaxTemp = (min,max) => {
return (
    <h3 className="">
        <span className="px-4">{min}&deg;</span>
        <span className="px-4">{max}&deg;</span>
    </h3>
)
}

export default WeatherCard;