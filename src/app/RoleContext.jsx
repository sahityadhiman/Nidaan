import React, { createContext, useContext, useState, useCallback } from 'react';
import { defaultSection, roleById } from '../config/nav.js';

/*
  RoleContext — lightweight role + section router (no react-router dependency).
  `role === null` means the Role Select landing page. Switching roles preserves
  the shared demo data (held by AppDataContext) so the story never resets.
*/

const RoleContext = createContext(null);
export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within <RoleProvider>');
  return ctx;
};

const STORE_KEY = 'nidaan_nav';

function loadNav() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && roleById(saved.role)) return saved;
  } catch { /* ignore */ }
  return { role: null, section: null };
}

export function RoleProvider({ children }) {
  const [{ role, section }, setNav] = useState(loadNav);

  const persist = useCallback((next) => {
    setNav(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  // Navigate to a role (and optionally a specific section). Defaults to the role's first section.
  const navigate = useCallback((nextRole, nextSection) => {
    if (!roleById(nextRole)) { persist({ role: null, section: null }); return; }
    persist({ role: nextRole, section: nextSection || defaultSection(nextRole) });
  }, [persist]);

  const setSection = useCallback((nextSection) => {
    persist({ role, section: nextSection });
  }, [persist, role, section]);

  const enterRole = useCallback((nextRole) => navigate(nextRole), [navigate]);
  const switchRole = useCallback((nextRole) => navigate(nextRole), [navigate]);
  const goToRoleSelect = useCallback(() => persist({ role: null, section: null }), [persist]);

  const value = { role, section, navigate, setSection, enterRole, switchRole, goToRoleSelect };
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
