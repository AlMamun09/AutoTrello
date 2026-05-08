import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { KanbanBoard } from './components/board/KanbanBoard';
import { NewProjectForm } from './components/projects/NewProjectForm';
import { ProjectsList } from './components/projects/ProjectsList';
import { LandingPage } from './components/LandingPage';
import { getProjects, type Project } from './lib/db';

import { Outlet } from 'react-router-dom';
import { ZapIcon, GearIcon } from '@/lib/icons';

// ── Sidebar ────────────────────────────────────────────────────────
function AppSidebar({
  projects,
  collapsed,
  onToggle,
  onSettingsClick,
}: {
  projects: Project[];
  collapsed: boolean;
  onToggle: () => void;
  onSettingsClick: () => void;
}) {
  const location = useLocation();

  return (
    <aside className={`at-sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <div className="at-sidebar-logo">
        <ZapIcon />
        <span className="logo-text">AutoTrello</span>
      </div>

      {/* Nav */}
      <nav className="at-sidebar-nav">
        <div className="at-sidebar-section">Projects</div>

        {projects.map((p) => {
          const icons: Record<string, string> = { sdlc: '📦', education: '🎓', marketing: '📣', business: '🏢' };
          const icon = icons[p.template] || '📁';
          const isActive = location.pathname === `/project/${p.id}`;
          return (
            <Link key={p.id} to={`/project/${p.id}`} className={`at-nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            </Link>
          );
        })}

        <Link
          to="/project/new"
          className="at-nav-item"
          style={{ margin: '8px 14px', borderRadius: 6, border: '1px dashed rgba(255,255,255,0.2)', borderLeft: '1px dashed rgba(255,255,255,0.2)', justifyContent: 'center', padding: '7px' }}
        >
          <span className="nav-label" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>+ New Project</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="at-sidebar-footer">
        <div className="at-avatar">AM</div>
        <div className="at-user-info" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Alex Morgan</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Pro Plan</div>
        </div>
        <button onClick={onSettingsClick} style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', padding: 4 }} className="at-nav-item" title="Settings">
          <GearIcon />
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', top: 18, right: -12,
          width: 24, height: 24, borderRadius: '50%',
          background: '#1E293B', border: '1px solid #334155',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#64748B', zIndex: 10,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
        </svg>
      </button>
    </aside>
  );
}

// ── Layout wrapper ─────────────────────────────────────────────────
function AppLayout() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getProjects().then(setProjects);
  }, [location]);

  return (
    <div className="at-shell">
      <AppSidebar
        projects={projects}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="at-main" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="at-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Outlet context={{ onSidebarToggle: () => setSidebarCollapsed(c => !c) }} />
        </div>
      </div>

      {showSettings && (
        <div className="at-modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="at-modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="at-modal-header">
              <span style={{ fontWeight: 700, fontSize: 16 }}>Settings</span>
              <button className="at-btn at-btn-ghost" onClick={() => setShowSettings(false)} style={{ padding: '4px 8px' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <SettingsPanel onClose={() => setShowSettings(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="project/new" element={<NewProjectForm />} />
          <Route path="project/:projectId" element={<KanbanBoard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
