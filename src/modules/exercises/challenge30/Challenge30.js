import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getLearningLevel } from '../../lessons/learningLevel';
import VerbPractice from './VerbPractice';

const Challenge30 = () => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const userId = user?.id || 'guest';
  return <VerbPractice key={userId + '-' + level} level={level} userId={userId} />;
};

export default Challenge30;
