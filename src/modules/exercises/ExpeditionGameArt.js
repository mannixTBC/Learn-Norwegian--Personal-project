import React, { useId } from 'react';

// Small, meaningful illustrations for the hub; game screens keep their own artwork.
export default function ExpeditionGameArt({ type }) {
  const id = useId().replace(/:/g, '');
  const teal = `url(#exp-teal-${id})`, gold = `url(#exp-gold-${id})`;
  return <svg className="mini-art" viewBox="0 0 160 140" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`exp-teal-${id}`} x2=".8" y2="1"><stop stopColor="#4e8490" /><stop offset=".5" stopColor="#205766" /><stop offset="1" stopColor="#0c3443" /></linearGradient>
      <linearGradient id={`exp-gold-${id}`} x2=".8" y2="1"><stop stopColor="#fff0b7" /><stop offset=".5" stopColor="#f8cc64" /><stop offset="1" stopColor="#dc9b29" /></linearGradient>
    </defs>
    {type === 'listen' && <g stroke="#153e4b" strokeWidth="4" strokeLinecap="round">
      <path d="M28 89V66a52 52 0 0 1 104 0v23" fill="none" strokeWidth="12" /><path d="M28 66a52 52 0 0 1 104 0" fill="none" stroke="#618a90" strokeWidth="4" />
      <rect x="17" y="65" width="23" height="57" rx="11" fill={gold} stroke="#c99438" /><rect x="32" y="68" width="15" height="55" rx="7" fill={teal} />
      <rect x="120" y="65" width="23" height="57" rx="11" fill={gold} stroke="#c99438" /><rect x="113" y="68" width="15" height="55" rx="7" fill={teal} />
      <path d="M58 91v15m11-25v32m11-42v49m11-37v29m11-19v12" stroke="#a3aaa0" strokeWidth="5" />
    </g>}
    {type === 'pronunciation' && <g stroke="#153e4b" strokeWidth="4" strokeLinecap="round">
      <rect x="60" y="11" width="40" height="79" rx="20" fill={teal} /><path d="M60 65h40v7a20 20 0 0 1-40 0Z" fill={gold} stroke="#c99438" />
      <path d="M48 61v13a32 32 0 0 0 64 0V61M80 106v19m-24 0h48" fill="none" />
      <path d="M73 26h1m12 0h1M73 37h1m12 0h1M73 48h1m12 0h1" stroke="#8aa8ad" strokeWidth="4" />
      <path d="M33 43q-9 15 0 29m94-29q9 15 0 29M23 33q-15 25 0 49m114-49q15 25 0 49" fill="none" stroke="#e7af3c" strokeWidth="5" />
    </g>}
    {type === 'quiz' && <g stroke="#153e4b" strokeWidth="4" strokeLinejoin="round">
      <path d="M14 31h132v89H14Z" fill={gold} stroke="#c99438" /><path d="M22 23q32-9 58 7 26-16 58-7v89q-32-8-58 6-26-14-58-6Z" fill="#fffaf0" />
      <path d="M80 30v88M30 119h100" fill="none" /><path d="M93 42q16-6 31-4m-31 18q16-6 31-4m-31 18q16-6 31-4m-31 18q16-6 31-4m-31 18q16-6 31-4" fill="none" stroke="#e8bd62" strokeWidth="4" />
      <text x="50" y="85" textAnchor="middle" fontFamily="Georgia,serif" fontSize="45" fontWeight="700" fill="#153e4b" stroke="none">A</text>
    </g>}
    {type === 'order' && <g fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#153e4b" strokeWidth="2">
      <g transform="rotate(-9 29 70)"><rect x="6" y="40" width="47" height="59" rx="6" fill="#dce8e7" stroke="#bdced0" /><path d="M10 94h38" stroke="#aebfc2" /><text x="29" y="77" textAnchor="middle">Hei</text></g>
      <g transform="rotate(-3 80 69)"><rect x="57" y="39" width="47" height="59" rx="6" fill={gold} stroke="#e2bf6c" /><text x="80" y="76" textAnchor="middle">det</text></g>
      <g transform="rotate(7 131 72)"><rect x="108" y="42" width="47" height="59" rx="6" fill="#dce8e7" stroke="#bdced0" /><path d="M112 96h38" stroke="#aebfc2" /><text x="131" y="79" textAnchor="middle">går</text></g>
    </g>}
    {type === 'verbs' && <g>
      <path d="M55 48C56 1 128 4 130 52" fill="none" stroke="#dc9f2d" strokeWidth="10" strokeLinecap="round" /><path d="m114 43 17 20 15-24" fill={gold} stroke="#dc9f2d" strokeWidth="2" strokeLinejoin="round" />
      <g transform="rotate(-9 66 84)"><rect x="22" y="49" width="88" height="70" rx="9" fill="#fffaf0" stroke="#194752" strokeWidth="4" /><text x="66" y="96" textAnchor="middle" fontFamily="Georgia,serif" fontSize="35" fontWeight="700" fill="#153e4b">abc</text></g>
    </g>}
    {type === 'word' && <g>
      <g fill="#e0ebeb" stroke="#c1d3d3" strokeWidth="2"><rect x="5" y="49" width="35" height="45" rx="6" /><rect x="45" y="49" width="35" height="45" rx="6" /><rect x="85" y="49" width="35" height="45" rx="6" /></g>
      <g fill="#153e4b" fontFamily="Georgia,serif" fontSize="30" fontWeight="700" textAnchor="middle"><text x="22" y="81">s</text><text x="62" y="81">k</text><text x="102" y="79">_</text></g>
      <path d="m123 69 24 30" stroke="#153e4b" strokeWidth="15" strokeLinecap="round" /><circle cx="114" cy="47" r="27" fill="#d4e7e7" fillOpacity=".7" stroke="#c9912c" strokeWidth="7" /><circle cx="114" cy="47" r="23" fill="none" stroke={gold} strokeWidth="4" /><path d="M101 44q1-12 13-12" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </g>}
    {type === 'missions' && <g stroke="#153e4b" strokeWidth="5" strokeLinejoin="round">
      <path d="M58 37V23q22-9 44 0v14" fill="none" strokeWidth="9" /><rect x="20" y="35" width="120" height="86" rx="15" fill={gold} /><path d="M25 43h110v42q-55 16-110 0Z" fill={teal} /><rect x="71" y="77" width="19" height="24" rx="4" fill={gold} />
    </g>}
    {type === 'review' && <g strokeLinecap="round" strokeLinejoin="round">
      <g transform="rotate(8 71 76)"><rect x="30" y="30" width="76" height="92" rx="10" fill="#fffaf0" stroke="#153e4b" strokeWidth="5" /><rect x="49" y="23" width="37" height="18" rx="6" fill={gold} stroke="#153e4b" strokeWidth="3" /><path d="M48 59h39M48 77h39M48 95h24" stroke="#e0aa3f" strokeWidth="6" /></g>
      <path d="M112 30q24 9 23 35m-12-7 12 14 13-17M115 110q15-8 17-22" fill="none" stroke="#1d5a67" strokeWidth="6" />
    </g>}
  </svg>;
}
