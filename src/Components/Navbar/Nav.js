import React from 'react';
import './nav.css';
import color from '@material-ui/core/colors/amber';


const Nav = () => {
    return (
        <nav className="nav">
            <h3>Logo</h3>
            <ul>
                <li>Vocabular</li>
                <li>Exercitii</li>
            </ul>
        </nav>
    )
}

export default Nav;

