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
  const [age, setAge] = React.useState('');

  const [open, setOpen] = React.useState(false);

  const handleChange =async( event) => {
    setAge(event.target.value);
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
        <InputLabel id="demo-controlled-open-select-label">City</InputLabel>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          value={age}
          onChange={handleChange}
        >
          <MenuItem value="Oslo">
            <em>Oslo</em>
          </MenuItem>
          <MenuItem value="Oslo">Oslo</MenuItem>
          
          <MenuItem value="Tromso">Tromso</MenuItem>
          <MenuItem value="Bergen">Bergen</MenuItem>
        </Select>
      </FormControl>
<p></p>
    </div>
  );
}
