import { useState, useEffect, useRef, type ChangeEvent, type MouseEvent } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getProjects, deleteProject, type Project } from '@/lib/db';
import { importProject } from '@/lib/export';
import { getSettings } from '@/lib/settings';
import { AppNavbar } from '@/components/AppNavbar';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';

const TEMPLATE_LABELS: Record<string, string> = {
  ai: 'AI Generated',
  sdlc: 'Software Development',
  education: 'Education',
  marketing: 'Marketing',
  smallbiz: 'Small Business',
  business: 'Small Business',
  hr: 'Human Resources',
  crm: 'Sales CRM',
  sales: 'Sales CRM',
  operations: 'Operations',
  design: 'Design',
};

const TEMPLATE_MARKS: Record<string, string> = {
  ai: 'AI',
  sdlc: 'SD',
  education: 'ED',
  marketing: 'MK',
  smallbiz: 'BZ',
  business: 'BZ',
  hr: 'HR',
  crm: 'SL',
  sales: 'SL',
  operations: 'OP',
  design: 'UX',
};

export function ProjectsList() {
  const { onSidebarToggle, onOpenSettings } = useOutletContext<{ onSidebarToggle: () => void; onOpenSettings: (highlightMissing?: boolean) => void }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getProjects().then(setProjects); }, []);

  // First-time onboarding: auto-open settings if config is incomplete
  useEffect(() => {
    const onboardingSeen = localStorage.getItem('autotrello_onboarding_seen');
    if (onboardingSeen) return;

    const s = getSettings();
    if (!s.aiApiKey || !s.trelloApiKey) {
      localStorage.setItem('autotrello_onboarding_seen', '1');
      onOpenSettings(true);
    }
  }, [onOpenSettings]);

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        await importProject(e.target.files[0]);
        setProjects(await getProjects());
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const requestDelete = (project: Project, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete.id);
    setProjects(projects.filter(p => p.id !== projectToDelete.id));
    setProjectToDelete(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AppNavbar
        title="Projects"
        onSidebarToggle={onSidebarToggle}
        onOpenSettings={onOpenSettings}
        onImport={() => fileInputRef.current?.click()}
      />

      <div className="at-page-scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h2 className="at-page-title">Your Projects</h2>
            <p className="at-page-subtitle">Generate, import, and manage AI-created backlog workspaces.</p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            <button className="at-btn at-btn-ghost" onClick={() => fileInputRef.current?.click()}>
              Import JSON
            </button>
            <Link to="/project/new" className="at-btn at-btn-primary">+ New Project</Link>
          </div>
        </div>

        {projects.length === 0 && (
          <div className="at-empty-state">
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 20, background: 'rgba(184,247,212,0.1)', border: '1px solid rgba(184,247,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--at-primary)" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 850, color: 'var(--at-text)', marginBottom: 8 }}>No projects yet</div>
            <div style={{ fontSize: 14, color: 'var(--at-text-subtle)', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.6 }}>Create your first project to generate an AI-powered backlog from documents or paste text requirements.</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/project/new" className="at-btn at-btn-primary" style={{ display: 'inline-flex' }}>+ New Project</Link>
              <button className="at-btn at-btn-secondary" onClick={() => fileInputRef.current?.click()}>Import JSON</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {projects.map(p => (
            <Link key={p.id} to={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="at-project-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <span className="at-avatar-sm" style={{ width: 36, height: 36, fontSize: 11 }}>
                      {TEMPLATE_MARKS[p.template] ?? 'AT'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 850, color: 'var(--at-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--at-text-subtle)', marginTop: 3 }}>{TEMPLATE_LABELS[p.template] ?? p.template}</div>
                    </div>
                  </div>

                  <button
                    onClick={e => requestDelete(p, e)}
                    style={{ color: 'var(--at-text-muted)', padding: '8px', fontSize: 14, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
                    title="Delete project"
                    aria-label={`Delete project ${p.name}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>

                <div style={{ fontSize: 11, color: 'var(--at-text-muted)', marginTop: 'auto' }}>
                  Created {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {projectToDelete && (
        <DeleteProjectDialog
          project={projectToDelete}
          onCancel={() => setProjectToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
