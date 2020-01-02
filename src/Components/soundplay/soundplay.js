import React, { Component } from 'react'
import {Howl, Howler} from 'howler';
import Sound1 from '../audio/sound1.mp3';
import Sound2 from '../audio/1.mp3';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';

const audioCLips = [
    {sound:Sound1, label:"sunet" },

]
class App1 extends Component{
    soundPlay = (src) => {
        const sound = new Howl({
            src
        })
        sound.play();
    }

    renderButtonSound = () => {
        return audioCLips.map((soundObj,index)=>{
            return (
                <PlayCircleFilledWhiteIcon key={index} onClick={()=>this.soundPlay(soundObj.sound,soundObj.label)}>

                </PlayCircleFilledWhiteIcon>
            )
        })
    }
    render(){
        Howler.volume(1.0)
        return(
            <div>
                {this.renderButtonSound()}
            </div>
        )
    }
}

export default App1;