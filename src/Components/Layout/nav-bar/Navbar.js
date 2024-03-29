import React from 'react';
import { makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import NorwegianFlagIcon from './icons/Norwegian';
import MenuItem from '@material-ui/core/MenuItem';
import './icons/norwegian.css';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import {Link} from 'react-router-dom';
import './nav.css';
import styled from 'styled-components';


const StyledMenuIcon = styled(MenuIcon)`
color:white;
`



const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 0,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    flag : {
        marginRight: theme.spacing(130),
        borderRadius : 20,
        
    },
    root1: {
      display: 'flex',
    },
    paper: {
      marginRight: theme.spacing(2),
    },
  }));




  export default  Navbar => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }
 
    return(
        <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense" display="flex">
          
            
        <div className={classes.root1}>
      
      <div>
        <Button
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <StyledMenuIcon />
        </Button>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper >
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    <Link to="/vocabular" className="linkcss">
                    <MenuItem onClick={handleClose} style={{textDecoration:'none'}}>Lessons</MenuItem>
                    </Link>
                    <Link to="/exercitiu" className="linkcss">
                    <MenuItem onClick={handleClose}>Exercises</MenuItem>
                    </Link>
                    <Link to="/wheather" className="linkcss">
                    <MenuItem onClick={handleClose}>Whether</MenuItem>
                    </Link>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
          
          <Typography variant="h6" color="inherit" >
          <Link className="link homelink" to="/" >
                    DiscoverNorway.com
          </Link>
          </Typography>

          <Typography>
          <Link  id="short-menu" className="link" to="/exercitiu" >
                    Exercises
          </Link>
          </Typography>

          <Typography>
          <Link  id="short-menu" className="link" to="/vocabular" >
                    Lessons
          </Link>
          </Typography>

          <Typography>
          <Link  id="short-menu" className="link" to="/wheather" >
                    Whether
          </Link>
          </Typography>
          <Typography>

          <Link  id="short-menu" className="link" to="/wheather" >
                    News
          </Link>
          </Typography>
    
          <NorwegianFlagIcon  className="flag-icon"/>
        
       
        </Toolbar>
        
      </AppBar>
    </div>
    )
    
    }



