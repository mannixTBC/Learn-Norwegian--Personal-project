import React from 'react';


const Progres = ({width}) => {
    return(
        <div class="progress">
            <div class="progress-bar progress-bar-striped bg-success" style={{width:`${width}%`}} role="progressbar" width = "25" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div> 
    )
}

export default Progres;