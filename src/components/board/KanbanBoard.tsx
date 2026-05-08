import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { deleteTask, getProject, getTasks, saveTask, type Task, type Project } from '@/lib/db';
import { TEMPLATES } from '@/lib/templates';
import { DndContext, type DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import { TaskEditModal } from './TaskEditModal';
import { importProject, exportProject } from '@/lib/export';
import { pushToTrello } from '@/lib/trello';
import { AppNavbar } from '@/components/AppNavbar';

// Column accent colors
const COL_COLORS: Record<string, string> = {
  'Backlog': '#94A3B8',
  'To Do': '#2563EB',
  'In Progress': '#F97316',
  'In Review': '#A855F7',
  'Done': '#22C55E',
};

function getColColor(col: string): string {
  if (COL_COLORS[col]) return COL_COLORS[col];
  const lc = col.toLowerCase();
  if (lc.includes('backlog')) return '#94A3B8';
  if (lc.includes('todo') || lc.includes('to do')) return '#2563EB';
  if (lc.includes('progress')) return '#F97316';
  if (lc.includes('review')) return '#A855F7';
  if (lc.includes('done') || lc.includes('complete')) return '#22C55E';
  return '#64748B';
}

import { AiChatPanel } from './AiChatPanel';

// ── Trello Sync Panel ──────────────────────────────────────────────
function TrelloSyncPanel({ project, tasks, onClose }: {
  project: Project;
  tasks: Task[];
  onClose: () => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [syncMsg, setSyncMsg] = useState('');

  const template = TEMPLATES[project.template];
  const columns = template?.columns ?? [];

  const handleSync = async () => {
    setSyncing(true);
    setProgress(10);
    setSyncMsg('Connecting to Trello...');
    try {
      let p = 10;
      const interval = setInterval(() => {
        p = Math.min(p + 8, 90);
        setProgress(p);
      }, 400);
      const url = await pushToTrello(project, tasks, (msg) => setSyncMsg(msg));
      clearInterval(interval);
      setProgress(100);
      setSyncMsg('Done! Opening board...');
      setTimeout(() => window.open(url, '_blank'), 800);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="at-side-panel" style={{ width: 320 }}>
      <div className="at-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0079BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Sync to Trello</span>
        </div>
        <button className="at-btn at-btn-ghost" onClick={onClose} style={{ padding: '4px 6px' }}>✕</button>
      </div>
      <div className="at-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="at-form-group">
          <label className="at-label">Board Name</label>
          <input className="at-input" defaultValue={`${project.name} — AutoTrello`} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 8 }}>Lists Preview</div>
          {columns.map(col => (
            <div key={col} className="at-sync-list-item">
              <div className="at-sync-dot" style={{ background: getColColor(col) }} />
              <span style={{ fontSize: 13, color: '#CBD5E1' }}>{col}</span>
              <span className="at-sync-count">{tasks.filter(t => t.column === col).length} cards</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[['Cards', tasks.length], ['Subtasks', tasks.reduce((a,t) => a + (t.subtasks?.length||0), 0)], ['Labels', [...new Set(tasks.flatMap(t => t.labels||[]))].length]].map(([lbl, val]) => (
            <div key={lbl as string} className="at-stat-box">
              <div className="stat-num">{val}</div>
              <div className="stat-lbl">{lbl}</div>
            </div>
          ))}
        </div>

        {syncing && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: '#94A3B8' }}>
              <span>{syncMsg}</span><span>{progress}%</span>
            </div>
            <div className="at-progress-bg">
              <div className="at-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button className="at-btn at-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={handleSync} disabled={syncing}>
          {syncing ? <><div className="at-spinner" style={{ marginRight: 8 }} />Syncing…</> : 'Create Trello Board'}
        </button>
      </div>
    </div>
  );
}

// ── KanbanBoard ────────────────────────────────────────────────────
export function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { onSidebarToggle } = useOutletContext<{ onSidebarToggle: () => void }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [srsCollapsed, setSrsCollapsed] = useState(false);
  const [showTrello, setShowTrello] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    let cancelled = false;

    async function loadData(id: string) {
      const p = await getProject(id);
      if (p && !cancelled) {
        setProject(p);
        setTasks(await getTasks(id));
      }
    }

    if (projectId) {
      void loadData(projectId);
    }

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;
    let targetColumn = activeTask.column;
    if (over.data.current?.type === 'Column') targetColumn = over.id as string;
    else { const ot = tasks.find(t => t.id === over.id); if (ot) targetColumn = ot.column; }
    if (activeTask.column !== targetColumn) {
      const updated = { ...activeTask, column: targetColumn, updated_at: new Date().toISOString() };
      setTasks(tasks.map(t => t.id === active.id ? updated : t));
      await saveTask(updated);
    }
  };

  if (!project) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#64748B', fontSize: 14 }}>
      Loading project…
    </div>
  );

  const template = TEMPLATES[project.template];
  if (!template) return <div style={{ padding: 24, color: '#EF4444' }}>Invalid template</div>;
  const columns = template.columns;

  const handleExport = async () => {
    if (project) await exportProject(project.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AppNavbar
        title={project.name}
        templateName={template.name || project.template}
        onSidebarToggle={onSidebarToggle}
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
        onSync={() => setShowTrello(true)}
      />

      {/* Tab bar */}
      <div className="at-tabbar">
        <button className="at-tab active">Kanban Board</button>
        <button className="at-tab" onClick={() => navigate('/project/new')}>Generate Backlog</button>
      </div>

      {/* Board + panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Kanban */}
        <div className="at-kanban-board">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.column === col);
              return (
                <div key={col} className="at-kanban-col">
                  <div className="at-col-header" style={{ '--col-color': getColColor(col) } as CSSProperties}>
                    <span className="at-col-name">{col}</span>
                    <span className="at-col-count">{colTasks.length}</span>
                    <button 
                      className="at-col-add"
                      onClick={() => setEditingTask({
                        id: crypto.randomUUID(),
                        project_id: project.id,
                        title: '',
                        description: '',
                        column: col,
                        priority: 'Medium',
                        subtasks: [],
                        labels: [],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      })}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                  <div className="at-col-body">
                    <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {colTasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} onClick={() => setEditingTask(task)} />
                      ))}
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </DndContext>
        </div>

        {/* Right panel */}
        {showTrello ? (
          <TrelloSyncPanel project={project} tasks={tasks} onClose={() => setShowTrello(false)} />
        ) : (
          <AiChatPanel
            project={project}
            tasks={tasks}
            collapsed={srsCollapsed}
            onCollapse={() => setSrsCollapsed(true)}
            onExpand={() => setSrsCollapsed(false)}
          />
        )}
      </div>

      {/* Hidden import input */}
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={async e => {
        if (e.target.files?.[0]) { await importProject(e.target.files[0]); }
      }} />

      {/* Task edit modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          columns={columns}
          onClose={() => setEditingTask(null)}
          onSave={async updated => { 
            await saveTask(updated); 
            setTasks(prev => prev.some(t => t.id === updated.id) ? prev.map(t => t.id === updated.id ? updated : t) : [...prev, updated]); 
            setEditingTask(null); 
          }}
          onDelete={async () => {
            await deleteTask(editingTask.id);
            setTasks(tasks.filter(t => t.id !== editingTask.id));
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
