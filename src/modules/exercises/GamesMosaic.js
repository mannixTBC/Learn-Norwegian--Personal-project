import React from 'react';
import MobileAppNav from '../layout/MobileAppNav';
import PracticeOverview from './PracticeOverview';

export default function GamesMosaic({ level, cards, activities, reviewStats }) {
  return <main className="practice-hub">
    <PracticeOverview {...{ level, cards, activities, reviewStats }} />
    <MobileAppNav activeLevel={level} />
  </main>;
}
