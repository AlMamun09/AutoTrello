import { useState, useEffect, useRef, type ChangeEvent, type MouseEvent } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getProjects, deleteProject, type Project } from '@/lib/db';
import { importProject } from '@/lib/export';
import { AppNavbar } from '@/components/AppNavbar';

const TEMPLATE_LABELS: Record<string, string> = {
  sdlc: 'Software Development',
  education: 'Education',
  marketing: 'Marketing',
  business: 'Small Business',
  hr: 'Human Resources',
  sales: 'Sales CRM',
  operations: 'Operations',
  design: 'Design',
};

const TEMPLATE_ICONS: Record<string, string> = {
  sdlc: '💻', education: '🎓', marketing: '📣', business: '🏢',
  hr: '👥', sales: '💼', operations: '⚙️', design: '🎨',
};

export function ProjectsList() {
  const { onSidebarToggle } = useOutletContext<{ onSidebarToggle: () => void }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getProjects().then(setProjects); }, []);

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try { await importProject(e.target.files[0]); setProjects(await getProjects()); }
      catch (err: unknown) { alert(err instanceof Error ? err.message : String(err)); }
    }
  };

  const handleDelete = async (id: string, e: MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this project and all its tasks?')) {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AppNavbar 
        title="Projects"
        onSidebarToggle={onSidebarToggle}
        onImport={() => fileInputRef.current?.click()}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', background: 'var(--at-bg)' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>Your Projects</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          <button className="at-btn at-btn-ghost" onClick={() => fileInputRef.current?.click()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import JSON
          </button>
          <Link to="/project/new" className="at-btn at-btn-primary">+ New Project</Link>
        </div>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px', border: '2px dashed #334155', borderRadius: 12, color: '#64748B' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>No projects yet</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Create a project to generate your first AI-powered backlog</div>
          <Link to="/project/new" className="at-btn at-btn-primary" style={{ display: 'inline-flex' }}>+ New Project</Link>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {projects.map(p => (
          <Link key={p.id} to={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#1E293B', border: '1px solid #334155', borderRadius: 10,
                padding: '18px', cursor: 'pointer', transition: '150ms ease', display: 'flex', flexDirection: 'column', gap: 10, height: '100%',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLDivElement).style.background = '#243044'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#334155'; (e.currentTarget as HTMLDivElement).style.background = '#1E293B'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{TEMPLATE_ICONS[p.template] ?? '📁'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{TEMPLATE_LABELS[p.template] ?? p.template}</div>
                  </div>
                </div>
                <button
                  onClick={e => handleDelete(p.id, e)}
                  style={{ color: '#475569', padding: '2px 4px', fontSize: 14, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                  title="Delete project"
                >✕</button>
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 'auto' }}>
                Created {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
