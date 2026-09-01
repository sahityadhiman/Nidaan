import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useRole } from '../app/RoleContext.jsx';
import { useAppData } from '../app/AppDataContext.jsx';
import { TOUR_STEPS, TOUR_LENGTH } from './tourSteps.js';

/*
  TourContext — the tour state machine. On start it re-seeds the demo city so the
  burst-pipe narrative always begins clean, then drives role+section navigation,
  fires each step's live action, and exposes state to the spotlight overlay.
*/
const TourContext = createContext(null);
export const useTour = () => useContext(TourContext);

export function TourProvider({ children }) {
  const { navigate } = useRole();
  const app = useAppData();
  const appRef = useRef(app);
  appRef.current = app;

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);     // re-seeding at start
  const [running, setRunning] = useState(false); // a step action is in flight
  const ranRef = useRef(new Set());

  const start = useCallback(async () => {
    setBusy(true);
    ranRef.current = new Set();
    try { await appRef.current.reseed(); } catch { /* ignore */ }
    setBusy(false);
    setStepIndex(0);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    setRunning(false);
  }, []);
  const skip = finish;

  const next = useCallback(() => {
    setStepIndex(i => {
      if (i >= TOUR_LENGTH - 1) { setActive(false); return i; }
      return i + 1;
    });
  }, []);

  const prev = useCallback(() => setStepIndex(i => Math.max(0, i - 1)), []);

  // Drive navigation + the live action whenever we land on a step.
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    navigate(step.role, step.section);

    if (step.action && !ranRef.current.has(stepIndex)) {
      ranRef.current.add(stepIndex);
      setRunning(true);
      Promise.resolve(step.action(appRef.current, { stepIndex }))
        .catch(err => console.error('Tour step action failed:', err))
        .finally(() => setRunning(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  const value = {
    active, stepIndex, busy, running,
    step: active ? TOUR_STEPS[stepIndex] : null,
    total: TOUR_LENGTH,
    isLast: stepIndex >= TOUR_LENGTH - 1,
    isFirst: stepIndex === 0,
    start, next, prev, skip, finish,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
