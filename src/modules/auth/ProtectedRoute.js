import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();
  return <Route {...rest} render={(props) => isAuthenticated ? <Component {...props} /> : <Redirect to={`/autentificare?redirect=${encodeURIComponent(`${props.location.pathname}${props.location.search}`)}`} />} />;
};

export default ProtectedRoute;
