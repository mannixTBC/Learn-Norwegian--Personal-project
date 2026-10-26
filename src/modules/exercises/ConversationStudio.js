import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import catalog from './conversationScenarios.json';
import { readStudioLearning } from './studioLearning';
import { resolvePublicScenario } from './scenarioDifficulty.mjs';
import useConversationSession from './useConversationSession';
import { getLearningLevel } from '../lessons/learningLevel';
import { getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { useAuth } from '../auth/AuthContext';
import { isInstalledAppView } from '../../services/appExperience';
import './ConversationStudio.css';
import DesktopConversationStudio from './DesktopConversationStudio';
import MobileConversationStudio from './MobileConversationStudio';
import './GuidedMission.css';

export default function ConversationStudio() {
  const { user } = useAuth();
  const location = useLocation();
  const [, refreshLearning] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.addEventListener) return;
    const update = () => refreshLearning(v => v + 1);
    window.addEventListener('storage', update); window.addEventListener('focus', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('focus', update); };
  }, []);
  const level = getLearningLevel(location.search);
  const learning = readStudioLearning(level, user);
  const path = getCareerPath(getCareerProfile(user)?.pathId);
  const scenarios = useMemo(() => catalog.scenarios.map(source => {
    const resolved = resolvePublicScenario(source, catalog.levels, level);
    return { ...resolved.scenario, difficulty: resolved.difficulty };
  }).sort((a, b) => Number(b.path === path.id) - Number(a.path === path.id)), [level, path.id]);
  const flow = useConversationSession({ userId: user?.id, level, pathId: path.id, scenarios, initialScenarioId: new URLSearchParams(location.search).get('scenariu') });
  const { session, messages, busy, error } = flow;
  const selected = scenarios.find(s => s.id === flow.scenarioId);
  const [hint, setHint] = useState(false);
  const bottom = useRef(null), input = useRef(null), result = useRef(null), errorBox = useRef(null);
  const restoring = !session && Boolean(flow.savedToken);
  const blocked = error && (flow.operation === 'start' || ['restart', 'auth', 'limit'].includes(error.kind));
  const remaining = session ? session.maxTurns - session.turn : (selected?.difficulty || catalog.levels[level]).turns;
  const loginUrl = '/autentificare?redirect=' + encodeURIComponent('/scenarii?nivel=' + level);
  useEffect(() => { if (!isInstalledAppView()) bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages, busy]);
  useEffect(() => { setHint(false); }, [selected?.id, level, session?.turn]);
  useEffect(() => {
    if (busy) return;
    if (error) errorBox.current?.focus();
    else if (session?.done) result.current?.focus();
    // Voice is the primary action; do not open the keyboard automatically.
  }, [busy, session, error]);

  const View = isInstalledAppView() ? MobileConversationStudio : DesktopConversationStudio;
  return <View userId={user?.id} learning={learning} {...{ level, path, scenarios, selected, flow, hint, setHint, loginUrl, blocked, restoring, remaining }}
    bottomRef={bottom} inputRef={input} resultRef={result} errorRef={errorBox}/>;
}
