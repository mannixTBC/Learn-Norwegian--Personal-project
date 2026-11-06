import {ui} from '../../languages/messages.js';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function ControlledOpenSelect(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleChange = async (event) => {
    await props.setCity(event.target.value);
    props.getWeather();
    console.log(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
 
  return (
    <div>
      
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-controlled-open-select-label">{ui('web_3feabbe0172f85e7')}</InputLabel>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          onChange={handleChange}
        >
          
          <MenuItem value="Oslo">{ui('web_43152cc97f457f27')}</MenuItem>
          <MenuItem value="Tromso">{ui('web_9edfa4753032bb85')}</MenuItem>
          <MenuItem value="Bergen">{ui('web_deae09060dcc8c1b')}</MenuItem>
        </Select>
      </FormControl>
<p></p>
    </div>
  );
}
