import React from 'react';
import { isInstalledAppView } from '../../services/appExperience';
import './SessionLoading.css';

/** Branded, indeterminate splash while the existing session check completes. */
export default function SessionLoading() {
  if (!isInstalledAppView()) return <section className="session-loading session-loading--web" role="status" aria-live="polite" aria-label="Verificăm sesiunea">
    <span className="session-loading__web-ring" aria-hidden="true" />
    <p>Se încarcă…</p>
  </section>;
  return <section className="session-loading" aria-label="Încărcare NordLingo">
    <div className="session-loading__content">
      <img className="session-loading__logo" src="/branding/nordlingo-selected-color.png" alt="NordLingo" width="2048" height="683" fetchpriority="high" />
      <img className="session-loading__scene" src="/images/loading-fjord.webp" alt="" width="900" height="1350" fetchpriority="high" />
      <div className="session-loading__status" role="status" aria-live="polite">
        <div className="session-loading__track" aria-hidden="true"><span /></div>
        <p>Pregătim totul pentru tine…</p>
      </div>
    </div>
  </section>;
}
