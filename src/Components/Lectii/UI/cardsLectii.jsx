import React, {Component} from 'react';
import Card from './cardUI';
import './card-style.css'
import styled from 'styled-components';
import img1 from './icons/cardimage1.jpg';
import img2 from './icons/cardimage2.jpg';
import img3 from './icons/cardimage3.jpg';

const Card1 = styled(Card)`
&& {
    body{
        background: radial-gradient(#e5e5e5,#ffff,#e5e5e5);
    }

    .card{
        width: 20rem; 
    }
    
    .card:hover {
        box-shadow: 5px 10px 20px 1px  rgba(0, 0, 0, 0.253);
    }

    .card .card-body {
        padding:3rem 0 !important;
    }

    .card-text {
        font-size:.9rem;
        padding: 0.4rem 1.9rem;
    }
    
    .container-fluid .row{
        padding-top:6rem;
    }
    
    .card-img .card-img-top {
        height:10rem;
    }

  }
`
class Cards extends Component{

    render(){
        return(
            <div className="container-fluid d-flex justify-content-center">
                <div className="row">
                    <div className="col-md-4">
                        <Card1
                        imgsrc={img1}
                        title={"Leason 1"}
                        path={"/lectia1"}/>
                    </div>
                    <div className="col-md-4">
                        <Card1
                         imgsrc={img2}
                         title={"Leason 2"}
                         path={"/lectia2"}/>
                    </div>
                    <div className="col-md-4">
                        <Card1
                         imgsrc={img3}
                         title={"Leason 3"}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Cards;