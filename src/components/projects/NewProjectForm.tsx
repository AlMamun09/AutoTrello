import { useState, useRef, type DragEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { TEMPLATES } from '@/lib/templates';
import { parseDocument } from '@/lib/parser';
import { generateBacklog } from '@/lib/ai';
import { saveProject, saveTask } from '@/lib/db';
import { AppNavbar } from '@/components/AppNavbar';

const TEMPLATE_CARDS = [
  { id: 'sdlc', mark: 'SD', name: 'Software Development', desc: 'Epics, stories, and technical tasks.' },
  { id: 'smallbiz', mark: 'BZ', name: 'Small Business', desc: 'Operations, marketing, and management work.' },
  { id: 'education', mark: 'ED', name: 'Education', desc: 'Curriculum planning and course design.' },
  { id: 'hr', mark: 'HR', name: 'Human Resources', desc: 'Hiring pipelines and onboarding.' },
  { id: 'marketing', mark: 'MK', name: 'Marketing', desc: 'Campaigns, content, and launches.' },
  { id: 'crm', mark: 'SL', name: 'Sales CRM', desc: 'Pipeline stages and deal tracking.' },
  { id: 'operations', mark: 'OP', name: 'Operations', desc: 'Processes, SOPs, and logistics.' },
  { id: 'design', mark: 'UX', name: 'Design', desc: 'UI/UX, branding, and visual assets.' },
];

type InputMode = 'file' | 'text';

export function NewProjectForm() {
  const navigate = useNavigate();
  const { onSidebarToggle } = useOutletContext<{ onSidebarToggle: () => void }>();
  const [file, setFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [pastedText, setPastedText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [templateId, setTemplateId] = useState<string | null>(null);
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
    if (!projectName.trim()) { setError('Please enter a project name.'); return; }
    if (inputMode === 'file' && !file) { setError('Please upload a document or switch to pasted text.'); return; }
    if (inputMode === 'text' && !pastedText.trim()) { setError('Please paste project requirements or switch to file upload.'); return; }

    setError('');
    setIsProcessing(true);
    setProgressMsg(inputMode === 'file' ? 'Parsing document...' : 'Preparing pasted text...');

    try {
      const template = templateId ? TEMPLATES[templateId] ?? TEMPLATES.ai : TEMPLATES.ai;
      const text = inputMode === 'file' && file ? await parseDocument(file) : pastedText.trim();
      const generatedBacklog = await generateBacklog(text, template, setProgressMsg);
      const columns = generatedBacklog.columns;
      setProgressMsg('Saving project...');

      const now = new Date().toISOString();
      const projectId = uuidv4();
      await saveProject({
        id: projectId,
        name: projectName,
        template: template.id,
        custom_columns: columns,
        source_document_name: inputMode === 'file' ? file?.name : 'Pasted text',
        created_at: now,
        updated_at: now,
      });

      for (const [index, td] of generatedBacklog.tasks.entries()) {
        const column = td.column && columns.includes(td.column) ? td.column : columns[1] ?? columns[0];
        await saveTask({
          id: uuidv4(),
          project_id: projectId,
          title: td.title || 'Untitled',
          description: td.description || '',
          priority: td.priority || 'Medium',
          column,
          subtasks: td.subtasks || [],
          labels: td.labels || [],
          assignee: td.assignee || '',
          due_date: td.due_date || '',
          start_date: td.start_date || '',
          estimate: td.estimate || '',
          sort_order: index,
          created_at: now,
          updated_at: now,
        });
      }

      navigate(`/project/${projectId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AppNavbar
        title="New Project"
        onSidebarToggle={onSidebarToggle}
        hideActions={true}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="at-tabbar">
          <button className="at-tab" onClick={() => navigate(-1)}>Kanban Board</button>
          <button className="at-tab active">Generate Backlog</button>
        </div>

        <div className="at-page-scroll at-generate-page-scroll">
          <div className="at-generate-layout">
            <section className="at-generate-main">
              <div style={{ marginBottom: 26 }}>
                <div className="at-section-label">Create board</div>
                <h1 className="at-page-title">Generate Your Backlog</h1>
                <p className="at-page-subtitle">Upload a document or paste requirements. Template selection is optional.</p>
              </div>

              <div className="at-form-group" style={{ marginBottom: 18 }}>
                <label className="at-label">Project Name</label>
                <input className="at-input" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="My product launch" disabled={isProcessing} />
              </div>

              <div className="at-input-mode-switch" style={{ marginBottom: 16 }}>
                <button
                  className={inputMode === 'file' ? 'active' : ''}
                  onClick={() => setInputMode('file')}
                  disabled={isProcessing}
                >
                  Upload File
                </button>
                <button
                  className={inputMode === 'text' ? 'active' : ''}
                  onClick={() => setInputMode('text')}
                  disabled={isProcessing}
                >
                  Paste Text
                </button>
              </div>

              {inputMode === 'file' ? (
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
                      <div style={{ color: 'var(--at-primary)', fontSize: 13, fontWeight: 850, marginBottom: 8 }}>Drop document here</div>
                      <p style={{ color: 'var(--at-text-subtle)', fontSize: 13, marginBottom: 4 }}>or click to browse your files</p>
                      <p style={{ color: 'var(--at-text-muted)', fontSize: 11 }}>.pdf .txt .md .docx - max 100,000 characters</p>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 850, color: 'var(--at-text)' }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--at-text-muted)' }}>{(file.size / 1024).toFixed(0)} KB selected</div>
                      </div>
                      <button className="at-btn at-btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={e => { e.stopPropagation(); setFile(null); }}>Remove</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="at-form-group" style={{ marginBottom: 16 }}>
                  <label className="at-label">Project / SRS Text</label>
                  <textarea
                    className="at-textarea"
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    rows={12}
                    placeholder="Paste your SRS, project brief, meeting notes, requirements, feature list, or business process here..."
                    disabled={isProcessing}
                    style={{ minHeight: 300, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--at-text-muted)', fontSize: 11 }}>
                    <span>AI will convert this text into board cards, labels, priorities, and subtasks.</span>
                    <span>{pastedText.trim().length.toLocaleString()} characters</span>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: '12px 14px', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.22)', borderRadius: 16, color: 'var(--at-critical)', fontSize: 13, marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <button
                className="at-btn at-btn-primary"
                style={{ width: '100%', justifyContent: 'center', minHeight: 48, fontSize: 14 }}
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><div className="at-spinner" style={{ marginRight: 10 }} />{progressMsg || 'Analyzing document...'}</>
                ) : (
                  'Generate Backlog'
                )}
              </button>
            </section>

            <aside className="at-template-sidebar">
              <div style={{ marginBottom: 14 }}>
                <div className="at-section-label">Optional</div>
                <h2>Workflow Template</h2>
                <p>Choose a domain to guide the lists and AI output, or leave Auto selected.</p>
              </div>

              <button
                className={`at-template-option${templateId === null ? ' selected' : ''}`}
                onClick={() => setTemplateId(null)}
                disabled={isProcessing}
              >
                <span className="at-avatar-sm" style={{ width: 34, height: 34, fontSize: 11 }}>AI</span>
                <span>
                  <strong>Auto / Default</strong>
                  <small>Let AI create the workflow lists from your document.</small>
                </span>
              </button>

              <div className="at-template-option-list">
                {TEMPLATE_CARDS.map(tc => (
                  <button
                    key={tc.id}
                    className={`at-template-option${templateId === tc.id ? ' selected' : ''}`}
                    onClick={() => setTemplateId(tc.id)}
                    disabled={isProcessing}
                  >
                    <span className="at-avatar-sm" style={{ width: 34, height: 34, fontSize: 11 }}>{tc.mark}</span>
                    <span>
                      <strong>{tc.name}</strong>
                      <small>{tc.desc}</small>
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
