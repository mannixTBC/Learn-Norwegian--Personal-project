import React from 'react';
import WheatherCard from './Card';
import 'weather-icons/css/weather-icons.css';
import styled from 'styled-components';
import Menu from './wheatherDropMenu';

const WheatherCard1 = styled(WheatherCard)`
&&{
    .container{
        width:15rem;
    },
    .border-primary{
        width:15rem;
    }
    
}
`

const API_key = "53d81b0d0c74cce91d48f62434ea1b03";

class Wheather extends React.Component{
    constructor(){

        super()
        this.state={
            city:"Oslo",
            country:"no",
            icon:undefined,
            main:undefined,
            celsius:undefined,
            temp_max:undefined,
            temp_min:undefined,
            message: "" 
        }
        this.getWheather();

        this.wheatherIcon = {
            Thunderstorm:"wi-thunderstorm",
            Drizzle:"wi-sleet",
            Rain: "wi-storm-showers",
            Snow: "wi-snow",
            Atmosphere: "wi-fog",
            Clear: "wi-day-sunny",
            Clouds: "wi-day-fog"
        }

        
    }
    calcCelsius(temp){
        let cell =  Math.floor(temp - 273.15);
        return cell;
    };

    getWeatherIcon  (rangeId,icons) {
        
                switch(true){
                    case rangeId >=200 && rangeId <= 232:
                        this.setState({icon:this.wheatherIcon.Thunderstorm});
                            break;
                        case rangeId >=300 && rangeId <= 321:
                        this.setState({icon:this.wheatherIcon.Drizzle});
                            break;
                        case rangeId >=500 && rangeId <= 531:
                        this.setState({icon:this.wheatherIcon.Rain});
                            break;    
                        case rangeId >=600 && rangeId <= 622:
                        this.setState({icon:this.wheatherIcon.Rain});
                            break;
                        case rangeId >=701 && rangeId <= 781:
                        this.setState({icon:this.wheatherIcon.Atmosphere});
                            break;
                        case rangeId === 800:
                        this.setState({icon:this.wheatherIcon.Clear});
                            break; 
                         case rangeId >=801 && rangeId <= 804:
                        this.setState({icon:this.wheatherIcon.Clouds});
                            break;      
                       default:
                        this.setState({icon:this.wheatherIcon.Clouds});
                        
                 }    
        
    }

    getWheather = async()=>{
        const api_call = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${this.state.city},${this.state.country}&appid=${API_key}`);
        const response = await api_call.json();
        console.log(response);

        this.setState({
           celsius:this.calcCelsius(response.main.temp),
           temp_max: this.calcCelsius(response.main.temp_max),
           temp_min: this.calcCelsius(response.main.temp_min),
           description: response.weather[0].description,
           
        });
        this.getWeatherIcon(response.weather[0].id,this.wheatherIcon);
        
        
        console.log('intra in functie')
    }
   
    
      setCity=(city) => {
        this.setState({city:city})
      
      }
      choseCity = () => {
        return(
            <Menu 
                         
                       setCity={this.setCity}
                       getWeather = {this.getWheather}
                        />
        )
    }
    render(){
        return(
            <div>
                <WheatherCard1 
                city={this.state.city}
                temp_celsius={`${this.state.celsius}`}
                temp_min = {this.state.temp_min}
                temp_max = {this.state.temp_max}
                description = {this.state.description}
                wheatherIcon = {this.state.icon}
                choseCity = {this.choseCity()}
                / >
                   
                    <p>{this.state.message}</p>
            </div>
                
            
        )
    }
}

export default Wheather;


