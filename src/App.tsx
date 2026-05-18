import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { KanbanBoard } from './components/board/KanbanBoard';
import { NewProjectForm } from './components/projects/NewProjectForm';
import { ProjectsList } from './components/projects/ProjectsList';
import { LandingPage } from './components/LandingPage';
import { getProjects, type Project } from './lib/db';

import { Outlet } from 'react-router-dom';
import { ZapIcon, GearIcon, CodeIcon, BookOpenIcon, TrendingUpIcon, BriefcaseIcon, FolderIcon, UsersIcon, TagIcon, SettingsIcon, LayoutIcon } from '@/lib/icons';

// ── Sidebar ────────────────────────────────────────────────────────
function AppSidebar({
  projects,
  collapsed,
  mobileOpen,
  onToggle,
  onSettingsClick,
}: {
  projects: Project[];
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onSettingsClick: () => void;
}) {
  const location = useLocation();

  return (
    <aside className={`at-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <Link to="/" className="at-sidebar-logo" style={{ textDecoration: 'none' }}>
        <span className="at-sidebar-brand-mark">
          <ZapIcon size={20} color="#07111F" />
        </span>
        <span className="logo-text">AutoTrello AI</span>
      </Link>

      {/* Nav */}
      <nav className="at-sidebar-nav">
        <div className="at-sidebar-section">Projects</div>

        {projects.map((p) => {
          const icons: Record<string, any> = {
            ai: <ZapIcon />,
            sdlc: <CodeIcon />,
            education: <BookOpenIcon />,
            marketing: <TrendingUpIcon />,
            smallbiz: <BriefcaseIcon />,
            business: <BriefcaseIcon />,
            hr: <UsersIcon />,
            crm: <TagIcon />,
            sales: <TagIcon />,
            operations: <SettingsIcon />,
            design: <LayoutIcon />
          };
          const icon = icons[p.template] || <FolderIcon />;
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
          style={{ marginTop: 8, border: '1px dashed rgba(184,247,212,0.22)', justifyContent: 'center', padding: '9px' }}
        >
          <span className="nav-icon">+</span>
          <span className="nav-label" style={{ color: 'var(--at-primary)', fontSize: 12 }}>New Project</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="at-sidebar-footer">
        <button onClick={onSettingsClick} className="at-settings-button" title="Settings">
          <GearIcon />
          <span className="at-settings-label">Settings</span>
        </button>
      </div>

      {/* Collapse toggle — hidden on mobile via CSS */}
      <button
        className="at-sidebar-collapse-toggle"
        onClick={onToggle}
        style={{
          position: 'absolute', top: '50%', right: -12,
          transform: 'translateY(-50%)',
          width: 24, height: 24, borderRadius: '50%',
          background: '#0D1B2E', border: '1px solid rgba(184,247,212,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#B8F7D4', zIndex: 10,
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsHighlightMissing, setSettingsHighlightMissing] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    getProjects().then(setProjects);
  }, [location]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const isMobile = () => window.innerWidth <= 768;

  const handleSidebarToggle = () => {
    if (isMobile()) {
      setMobileSidebarOpen(v => !v);
    } else {
      setSidebarCollapsed(c => !c);
    }
  };

  const handleOpenSettings = (highlightMissing?: boolean) => {
    setSettingsHighlightMissing(!!highlightMissing);
    setShowSettings(true);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="at-shell">
      {!isLandingPage && (
        <>
          <div
            className={`at-sidebar-mobile-overlay${mobileSidebarOpen ? ' visible' : ''}`}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <AppSidebar
            projects={projects}
            collapsed={sidebarCollapsed}
            mobileOpen={mobileSidebarOpen}
            onToggle={handleSidebarToggle}
            onSettingsClick={() => handleOpenSettings()}
          />
        </>
      )}

      <div className="at-main" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="at-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Outlet context={{ onSidebarToggle: handleSidebarToggle, onOpenSettings: handleOpenSettings }} />
        </div>
      </div>

      {showSettings && (
        <div className="at-modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="at-modal at-settings-modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="at-modal-header">
              <span style={{ fontWeight: 700, fontSize: 16 }}>Settings</span>
              <button className="at-btn at-btn-ghost" onClick={() => setShowSettings(false)} style={{ padding: '4px 8px' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <SettingsPanel onClose={() => setShowSettings(false)} highlightMissing={settingsHighlightMissing} />
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
