import React from 'react';
import MobileAppNav from '../layout/MobileAppNav';
import PracticeOverview from './PracticeOverview';

export default function DesktopGamesHub({ level, cards = [], activities = [], reviewStats = {} }) {
  return <section className="practice-hub practice-hub--web" aria-label="Practică">
    <PracticeOverview {...{ level, cards, activities, reviewStats }} />
    <MobileAppNav activeLevel={level} />
  </section>;
}
