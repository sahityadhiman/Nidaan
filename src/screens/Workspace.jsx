import React from 'react';
import { Play, Info } from 'lucide-react';
import { useRole } from '../app/RoleContext.jsx';
import { useAppData } from '../app/AppDataContext.jsx';
import { useTour } from '../tour/TourContext.jsx';
import { sectionsFor, sectionMeta, roleById } from '../config/nav.js';
import { sectionComponent } from './sections/registry.js';
import SectionHeader from '../ui/SectionHeader.jsx';
import RoleSwitcher from '../ui/RoleSwitcher.jsx';

/*
  SCREEN 2 — Role Workspace. A thin glass top bar (brand, pill section nav, tour,
  role switcher) over the slate canvas, and a body that renders exactly ONE
  focused section with its header + InfoButton.
*/
export default function Workspace() {
  const { role, section, setSection, goToRoleSelect } = useRole();
  const { loading, toast } = useAppData();
  const tour = useTour();

  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const roleDef = roleById(role);
  const tabs = sectionsFor(role);
  const meta = sectionMeta(role, section);
  const SectionView = sectionComponent(role, section);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="mesh-bg" />

      {/* ---- Console top bar: Solid Blue Floating Panel ---- */}

      <header className="workspace-header" style={{
        position: 'sticky', top: '1.2rem', zIndex: 100,
        background: scrolled ? 'rgba(30, 64, 175, 0.72)' : '#1E40AF',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        border: scrolled ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        boxShadow: scrolled 
          ? '0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
          : '0 12px 32px rgba(30, 64, 175, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        margin: '1.2rem 1.5rem 1.2rem',
        display: 'flex', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0.95rem 1.8rem', gap: '1.5rem',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Left Block: Logo & Brand Name only */}
        <button onClick={goToRoleSelect} className="header-brand-block" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: '#ffffff', flexShrink: 0 }} title="Back to role select">
          <img src="/logo.png" alt="Nidaan" width={42} height={42} style={{ borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(255,255,255,0.9)' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.035em', fontFamily: 'var(--font-display)' }}>Nidaan</span>
        </button>

        {/* Center Block: Navigation tabs + Integrated Hint Text */}
        <div className="header-nav-block hide-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, overflowX: 'auto' }}>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '3px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
            maxWidth: '100%'
          }}>
            {tabs.map(t => {
              const Icon = t.icon; const isActive = section === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSection(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.45rem',
                    padding: '0.45rem 1.1rem', borderRadius: '4px',
                    fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? 'var(--brand-700)' : 'rgba(255, 255, 255, 0.85)',
                    background: isActive ? '#ffffff' : 'transparent',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                    }
                  }}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </nav>

          {/* Integrated hint text directly below navigation tabs in the center */}
          <span className="header-nav-hint" style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500, textAlign: 'center' }}>
            Hover (or tap) the ⓘ to learn about the feature
          </span>

        </div>

        {/* Right Block: Stacked Role name (top) and Guided Tour (bottom) */}
        <div className="header-actions-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>

          {/* Role switcher dropdown trigger on top */}
          <RoleSwitcher />
          
          {/* Guided Tour button directly below it */}
          <button 
            onClick={() => tour?.start()} 
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.74rem', fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              borderRadius: '6px', padding: '0.4rem 0.9rem',
              cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <Play size={10} fill="currentColor" />
            <span className="tour-button-text"> Guided Tour</span>
          </button>
        </div>
      </header>





      {/* ---- Body ---- */}
      <main style={{ flex: 1, padding: '1.9rem 1.5rem 3rem', maxWidth: '1320px', width: '100%', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', gap: '1rem' }}>
            <div className="pulsing-indicator" style={{ width: '20px', height: '20px' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>Establishing Nidaan connection…</p>
          </div>
        ) : (
          <div key={`${role}/${section}`} className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
            {meta && (
              <SectionHeader icon={meta.icon} title={meta.label} info={meta.info} tag={meta.tag} hint={meta.hint} eyebrow={roleDef?.name} />
            )}
            {SectionView ? <SectionView /> : <p style={{ color: 'var(--ink-muted)' }}>Section not found.</p>}
          </div>
        )}
      </main>

      {/* ---- Toast ---- */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 950,
          background: 'var(--ink-strong)', color: '#fff', padding: '0.8rem 1.2rem', borderRadius: '99px',
          boxShadow: 'var(--shadow-pop)', fontSize: '0.85rem', fontWeight: 600, maxWidth: '90vw',
          borderLeft: `4px solid ${toast.tone === 'danger' ? 'var(--critical)' : toast.tone === 'success' ? 'var(--grass)' : 'var(--brand)'}`,
          animation: 'slideInUp 0.3s ease-out',
        }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
