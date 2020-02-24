import React, {Component} from 'react';
import Card from './cardUI';
import './card-style.css'
import styled from 'styled-components';
import img1 from '../images/hangman/hangman_0.png';
import img2 from '../images/chestionar.jpg';

const Card1 = styled(Card)`
&& {
    body{
        background: radial-gradient(#e5e5e5,#ffff,#e5e5e5);
    };

    .card{
        width: 20rem;
       
    };
    
    .card:hover {
        box-shadow: 5px 10px 20px 1px  rgba(0, 0, 0, 0.253);
    };

    .card .card-body {
        padding:3rem 0 !important;
    };
    .card-text {
        font-size:.9rem;
        padding: 0.4rem 1.9rem;
    };
    .container-fluid .row{
        padding-top:6rem;
    };
    
    .card-img .card-img-top {
        height:10rem;
    };

    .col-md-4{
        display:contents
    };

  }
`
class CardsExercitii extends Component{




    render(){
        return(
            <div className="container-fluid d-flex justify-content-center">
                <div className="row">
                    <div className="col-md-4">
                        <Card1
                        imgsrc={img1}
                        title={"Spanzuratoarea"}
                        path={"/hangman"}/>
                    </div>
                    <div className="col-md-4">
                        <Card1
                         imgsrc={img2}
                         title={"Chestionar"}
                         path={"/chestionar"}/>
                    </div>
                    
                </div>
            </div>
        )
    }
}

export default CardsExercitii;