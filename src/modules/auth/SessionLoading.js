import {ui} from '../../languages/messages.js';
import React from 'react';
import { isInstalledAppView } from '../../services/appExperience';
import './SessionLoading.css';

/** Branded, indeterminate splash while the existing session check completes. */
export default function SessionLoading() {
  if (!isInstalledAppView()) return <section className="session-loading session-loading--web" role="status" aria-live="polite" aria-label={ui('web_690e13b83c3fb2ca')}>
    <span className="session-loading__web-ring" aria-hidden="true" />
    <p>{ui('web_02bf71cba392fbc4')}</p>
  </section>;
  return <section className="session-loading" aria-label={ui('web_31041594634d09fb')}>
    <div className="session-loading__content">
      <img className="session-loading__logo" src="/branding/nordlingo-selected-color.png" alt={ui('ui_ee728f3245aed708')} width="2048" height="683" fetchpriority="high" />
      <img className="session-loading__scene" src="/images/loading-fjord.webp" alt="" width="900" height="1350" fetchpriority="high" />
      <div className="session-loading__status" role="status" aria-live="polite">
        <div className="session-loading__track" aria-hidden="true"><span /></div>
        <p>{ui('web_b6188bc0a3041092')}</p>
      </div>
    </div>
  </section>;
}
