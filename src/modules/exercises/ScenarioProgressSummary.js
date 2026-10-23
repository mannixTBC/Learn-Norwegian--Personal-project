import React from 'react';
export default function ScenarioProgress({ progress, scenario, detail = false }) {
  if (!progress) return null;
  if (progress.legacy) return <p className="scenario-progress">Rezultat din versiunea anterioară. Exersează din nou.</p>;
  const { latest, best, attempts } = progress;
  const missing = scenario.goals.filter((_, i) => !latest.achieved.includes(i));
  return <div className="scenario-progress">
    <p><strong>{best.endReason === 'success' ? 'Misiune reușită' : 'De exersat'}</strong> · Cel mai bun rezultat: {best.achieved.length}/{scenario.goals.length}</p>
    {detail && <><p>Ultima încercare: {latest.achieved.length}/{scenario.goals.length} obiective · {attempts} {attempts === 1 ? 'încercare' : 'încercări'} · {new Date(latest.date).toLocaleDateString('ro-RO')}</p>
      {missing.length > 0 && <details><summary>De exersat după ultima încercare</summary><ul>{missing.map(goal => <li key={goal}>{goal}</li>)}</ul></details>}</>}
  </div>;
}
