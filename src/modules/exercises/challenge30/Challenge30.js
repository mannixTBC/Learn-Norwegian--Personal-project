import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getLearningLevel } from '../../lessons/learningLevel';
import VerbNotebook from './VerbNotebook';

const Challenge30 = () => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const params = new URLSearchParams(location.search);
  const requested = {verb:params.get('verb'),lesson:params.get('lectie')};
  const userId = user?.id || 'guest';
  return <VerbNotebook key={userId + '-' + level + '-' + location.search} level={level} userId={userId} requested={requested} />;
};

export default Challenge30;
