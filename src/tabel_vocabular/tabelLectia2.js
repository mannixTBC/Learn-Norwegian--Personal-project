import React from 'react';
import { makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { flexbox } from '@material-ui/system';
import styled from 'styled-components';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import {Howl, Howler} from 'howler';
import Sound1 from '../audio/Lectia2/11.mp3';
import Sound2 from '../audio/Lectia2/22.mp3';
import Sound3 from '../audio/Lectia2/33.mp3';
import Sound4 from '../audio/Lectia2/44.mp3';
import Sound5 from '../audio/Lectia2/55.mp3';



const NumberCell = styled(TableCell)`
&& {
  width: 100px;
  
  }
.tabel{
  margin-top:5rem;
}  
`


const soundPlay = (src) => {
  const sound = new Howl({
      src
  })

  sound.play();
}

const useStyles = makeStyles({
  root: {
    marginLeft:'200px',
    width: '80%',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    fontSize:'1,8cm'
  },
  table: {
    minWidth: 650,
    display: flexbox,
  },
  cuvant:{
    marginRight:"100px",
    color:"blue",
    width:'150px'
    
  },
  tabel:{
    width:"80%"
    
  },
  traducere:{
    textAlign:"center",  
  },

  pronuntie:{
    textAlign:"left",
  }

});

function createData(number, cuvant, traducere, sound) {
  return { number, cuvant, traducere, sound };
}

const rows = [
  createData(1, "hvordan", "Cum?", Sound1),
  createData(2, "hvorfor", "De ce?",Sound2),
  createData(3, "å hilse", "a saluta",Sound3),
  createData(4, "å jobbe", "a lucra",Sound4),
  createData(5, "å kunne", "a a putea",Sound5),
];

const Tabel2 = () => {
 
  const classes = useStyles();
  
  return (
   
    <div className={classes.tabel}>
    <Paper className={classes.root}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <NumberCell>#</NumberCell>
            <TableCell className={classes.cuvant}  style={{width:'30%'}}>Cuvant</TableCell>
            <TableCell className={classes.pronuntie} align="right">Pronuntie</TableCell>
            <TableCell className={classes.traducere} align="right">Traducere</TableCell>
            
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.number}>
              <TableCell component="th" scope="row">
                {row.number}
              </TableCell>
              <TableCell align="leftS">{row.cuvant}</TableCell>
              <TableCell>
                
                    
              <PlayCircleFilledWhiteIcon  onClick={() => soundPlay(row.sound)}>

            </PlayCircleFilledWhiteIcon>
                
                </TableCell>
              <TableCell className={classes.traducere} >{row.traducere}</TableCell>
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br></br>

    </Paper>
          
          
         
    </div>
  );
}


export default Tabel2;