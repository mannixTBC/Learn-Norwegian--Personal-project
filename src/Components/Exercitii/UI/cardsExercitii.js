import React, {Component} from 'react';
import Card from './cardUI';
import './card-style.css'
import img1 from './icons/hangman_0.png';
import img2 from './icons/chestionar.jpg';
import img3 from './icons/drag.png';


class CardsExercitii extends Component{

    render(){
        return(
            <div className="container-fluid d-flex justify-content-center">
                <div className="row">
                    <div className="col-md-4">
                        <Card
                        imgsrc={img1}
                        title={"Spanzuratoarea"}
                        path={"/hangman"}/>
                    </div>
                    <div className="col-md-4">
                        <Card
                         imgsrc={img2}
                         title={"Chestionar"}
                         path={"/chestionar"}/>
                    </div>
                    <div className="col-md-4">
                        <Card
                         imgsrc={img3}
                         title={"Drag and drop"}
                         path={"/chestionar"}/>
                    </div>
                    
                </div>
            </div>
        )
    }
}

export default CardsExercitii;