import React from 'react';
import { Link } from 'react-router-dom';
import './premium.css';

const BENEFITS = [
  'Evaluare pronunție nelimitată cu Azure Speech',
  'Asistent virtual ChatGPT pentru norvegiană',
  'Toate nivelurile și lecțiile (B1/B2 incluse)',
  'Provocarea de 30 de zile și recapitulare spațiată',
];

/**
 * UpgradeCard — card reutilizabil care invită utilizatorul la Premium.
 *
 * @param {{ feature?: string, compact?: boolean }} props
 * - feature: titlul funcționalității blocate (afăsat când gating-ul e local)
 * - compact: variantă mai strânsă pentru embedding în componente
 */
export default function UpgradeCard({ feature, compact = false }) {
  return (
    <div className={`upgrade-card${compact ? ' upgrade-card--compact' : ''}`}>
      <div className="upgrade-card__badge">★ Premium</div>
      {feature && <h3 className="upgrade-card__title">{feature} este exclusivă Premium</h3>}
      {!feature && <h3 className="upgrade-card__title">Treci la Premium</h3>}
      <ul className="upgrade-card__benefits">
        {BENEFITS.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
      <Link className="upgrade-card__cta" to="/premium">
        Află mai mult
      </Link>
    </div>
  );
}
