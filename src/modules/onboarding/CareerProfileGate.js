import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getCareerProfile } from '../../services/careerProfile';

const withCareerProfile = (Component) => {
  const CareerProfileGate = (props) => {
    const { user } = useAuth();
    const location = useLocation();
    const profile = getCareerProfile(user);

    if (!profile) {
      const destination = `${location.pathname}${location.search || ''}`;
      return <Redirect to={`/alege-directia?redirect=${encodeURIComponent(destination)}`} />;
    }

    return <Component {...props} />;
  };

  CareerProfileGate.displayName = `withCareerProfile(${Component.displayName || Component.name || 'Component'})`;
  return CareerProfileGate;
};

export default withCareerProfile;
