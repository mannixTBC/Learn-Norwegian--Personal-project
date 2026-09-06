import React from 'react';
import { useAuth } from '../auth/AuthContext';
import UpgradeCard from './UpgradeCard';

/**
 * PremiumGate — randează `children` doar dacă utilizatorul are Premium.
 *
 * În dezvoltare (dev bypass activ), toți utilizatorii sunt considerați Premium,
 * deci conținutul este mereu afișat — util pentru testare fără abonament.
 * În producție, când dev bypass e oprit, randează un card de upgrade în loc.
 *
 * @param {{ children?: React.ReactNode, feature?: string }} props
 */
export default function PremiumGate({ children, feature = 'Această funcționalitate' }) {
  const { isPremium } = useAuth();

  if (isPremium) return children;

  return (
    <div className="premium-gate">
      <UpgradeCard feature={feature} compact />
    </div>
  );
}
