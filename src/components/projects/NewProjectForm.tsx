import { useState, useRef, type DragEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { TEMPLATES } from '@/lib/templates';
import { parseDocument } from '@/lib/parser';
import { generateBacklog } from '@/lib/ai';
import { saveProject, saveTask } from '@/lib/db';
import { AppNavbar } from '@/components/AppNavbar';

const TEMPLATE_CARDS = [
  { id: 'sdlc',       emoji: '💻', name: 'Software Development', desc: 'Epics, user stories, and technical tasks.' },
  { id: 'business',   emoji: '🏢', name: 'Small Business',       desc: 'Operations and marketing tasks.' },
  { id: 'education',  emoji: '🎓', name: 'Education',            desc: 'Curriculum planning and course design.' },
  { id: 'hr',         emoji: '👥', name: 'Human Resources',      desc: 'Hiring pipelines and onboarding.' },
  { id: 'marketing',  emoji: '📣', name: 'Marketing',            desc: 'Campaigns, content, and launches.' },
  { id: 'sales',      emoji: '💼', name: 'Sales CRM',            desc: 'Pipeline stages and deal tracking.' },
  { id: 'operations', emoji: '⚙️', name: 'Operations',           desc: 'Processes, SOPs, and logistics.' },
  { id: 'design',     emoji: '🎨', name: 'Design',               desc: 'UI/UX, branding, and visual assets.' },
];

export function NewProjectForm() {
  const navigate = useNavigate();
  const { onSidebarToggle } = useOutletContext<{ onSidebarToggle: () => void }>();
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [templateId, setTemplateId] = useState('sdlc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please upload a document.'); return; }
    if (!projectName.trim()) { setError('Please enter a project name.'); return; }
    setError(''); setIsProcessing(true); setProgressMsg('Parsing document…');
    try {
      const template = TEMPLATES[templateId] ?? Object.values(TEMPLATES)[0];
      const text = await parseDocument(file);
      const tasksData = await generateBacklog(text, template, setProgressMsg);
      setProgressMsg('Saving project…');
      const projectId = uuidv4();
      await saveProject({ id: projectId, name: projectName, template: templateId, source_document_name: file.name, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      for (const td of tasksData) {
        await saveTask({ id: uuidv4(), project_id: projectId, title: td.title || 'Untitled', description: td.description || '', priority: td.priority || 'Medium', column: td.column || template.columns[0], subtasks: td.subtasks || [], labels: td.labels || [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
      navigate(`/project/${projectId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally { setIsProcessing(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AppNavbar 
        title="New Project"
        onSidebarToggle={onSidebarToggle}
        hideActions={true}
      />
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--at-bg)' }}>
        {/* Tab bar */}
        <div className="at-tabbar">
          <button className="at-tab" onClick={() => navigate(-1)}>Kanban Board</button>
          <button className="at-tab active">Generate Backlog</button>
        </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>Generate Your Backlog</h1>
          <p style={{ color: '#64748B', fontSize: 14 }}>Upload your SRS, business spec, or any project document</p>
        </div>

        {/* Project name */}
        <div className="at-form-group" style={{ marginBottom: 24 }}>
          <label className="at-label">Project Name</label>
          <input className="at-input" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="My Awesome Project" disabled={isProcessing} />
        </div>

        {/* Template grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {TEMPLATE_CARDS.map(tc => (
            <div
              key={tc.id}
              className={`at-template-card${templateId === tc.id ? ' selected' : ''}`}
              onClick={() => setTemplateId(tc.id)}
              style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, padding: '14px 12px' }}
            >
              <span style={{ fontSize: 22 }}>{tc.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9', marginBottom: 2 }}>{tc.name}</div>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>{tc.desc}</div>
              </div>
              {templateId === tc.id && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upload area */}
        <div
          className={`at-dropzone${dragging ? ' active' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          style={{ marginBottom: 16 }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
          {!file ? (
            <>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px' }}>
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
              <p style={{ color: '#64748B', fontSize: 13, marginBottom: 4 }}>Drop your file here or <span style={{ color: '#2563EB', fontWeight: 600 }}>click to browse</span></p>
              <p style={{ color: '#475569', fontSize: 11 }}>.pdf .txt .md .docx · max 100,000 characters</p>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{file.name}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{(file.size / 1024).toFixed(0)} KB</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <button className="at-btn at-btn-ghost" style={{ padding: '2px 6px', fontSize: 12 }} onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#EF4444', fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button
          className="at-btn at-btn-primary"
          style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 14, fontWeight: 600 }}
          onClick={handleSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <><div className="at-spinner" style={{ marginRight: 10 }} />{progressMsg || 'Analyzing document…'}</>
          ) : (
            <><span style={{ marginRight: 6 }}>✨</span> Generate Backlog</>
          )}
        </button>
      </div>
      </div>
    </div>
  );
}
