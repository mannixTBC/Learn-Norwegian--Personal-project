import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SessionLoading from './SessionLoading';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { initializing, isAuthenticated } = useAuth();
  return <Route {...rest} render={(props) => {
    if (initializing) return <SessionLoading />;
    return isAuthenticated ? <Component {...props} /> : <Redirect to={`/autentificare?redirect=${encodeURIComponent(`${props.location.pathname}${props.location.search}`)}`} />;
  }} />;
};

export default ProtectedRoute;
