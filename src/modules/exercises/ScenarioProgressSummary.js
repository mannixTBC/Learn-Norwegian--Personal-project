import {ui} from '../../languages/messages.js';
import React from 'react';
export default function ScenarioProgress({ progress, scenario, detail = false }) {
  if (!progress) return null;
  if (progress.legacy) return <p className="scenario-progress">{ui('web_c87f3ec25f3a074b')}</p>;
  const { latest, best, attempts } = progress;
  const missing = scenario.goals.filter((_, i) => !latest.achieved.includes(i));
  return <div className="scenario-progress">
    <p><strong>{best.endReason === 'success' ? 'Misiune reușită' : 'De exersat'}</strong>{ui('web_14b66662c93aff03')}{best.achieved.length}/{scenario.goals.length}</p>
    {detail && <><p>{ui('web_fc03628c6f4ddd75')}{latest.achieved.length}/{scenario.goals.length}{ui('web_f41691a1d6eebf20')}{attempts} {attempts === 1 ? 'încercare' : 'încercări'} · {new Date(latest.date).toLocaleDateString('ro-RO')}</p>
      {missing.length > 0 && <details><summary>{ui('web_64bd83391c5aa527')}</summary><ul>{missing.map(goal => <li key={goal}>{goal}</li>)}</ul></details>}</>}
  </div>;
}
