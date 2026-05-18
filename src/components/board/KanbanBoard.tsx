import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { deleteProject, deleteTask, getProject, getTasks, saveTask, type Task, type Project } from '@/lib/db';
import { TEMPLATES } from '@/lib/templates';
import { DndContext, type DragEndEvent, closestCorners, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import { TaskEditModal } from './TaskEditModal';
import { importProject, exportProject } from '@/lib/export';
import { pushToTrello } from '@/lib/trello';
import { AppNavbar } from '@/components/AppNavbar';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import type { BoardAgentAction } from '@/lib/ai';
import { useToast } from '@/components/ui/Toast';

// Column accent colors
const COL_COLORS: Record<string, string> = {
  'Backlog': '#7DD3FC',
  'To Do': '#60A5FA',
  'In Progress': '#FDBA74',
  'In Review': '#C4B5FD',
  'Done': '#B8F7D4',
};

function getColColor(col: string): string {
  if (COL_COLORS[col]) return COL_COLORS[col];
  const lc = col.toLowerCase();
  if (lc.includes('backlog')) return '#7DD3FC';
  if (lc.includes('todo') || lc.includes('to do')) return '#60A5FA';
  if (lc.includes('progress')) return '#FDBA74';
  if (lc.includes('review')) return '#C4B5FD';
  if (lc.includes('done') || lc.includes('complete')) return '#B8F7D4';
  return '#9FB1C8';
}

import { AiChatPanel } from './AiChatPanel';

function compareTasksByOrder(a: Task, b: Task) {
  return (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER)
    || new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    || a.title.localeCompare(b.title);
}

function DroppableColumnBody({ column, children }: { column: string; children: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column,
    data: { type: 'Column', column },
  });

  return (
    <div
      ref={setNodeRef}
      className="at-col-body"
      style={{
        background: isOver ? 'rgba(184,247,212,0.06)' : undefined,
        boxShadow: isOver ? 'inset 0 0 0 1px rgba(184,247,212,0.18)' : undefined,
      }}
    >
      {children}
    </div>
  );
}

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
  const columns = project.custom_columns?.length ? project.custom_columns : template?.columns ?? [];
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(tasks.map(t => t.id));
  const selectedTasks = tasks.filter(t => selectedTaskIds.includes(t.id) && selectedColumns.includes(t.column)).sort(compareTasksByOrder);

  const toggleColumn = (column: string) => {
    const enabled = selectedColumns.includes(column);
    setSelectedColumns(prev => enabled ? prev.filter(c => c !== column) : [...prev, column]);
    setSelectedTaskIds(prev => enabled
      ? prev.filter(id => tasks.find(t => t.id === id)?.column !== column)
      : Array.from(new Set([...prev, ...tasks.filter(t => t.column === column).map(t => t.id)]))
    );
  };

  const toggleTask = (task: Task) => {
    setSelectedTaskIds(prev => prev.includes(task.id) ? prev.filter(id => id !== task.id) : [...prev, task.id]);
    if (!selectedColumns.includes(task.column)) setSelectedColumns(prev => [...prev, task.column]);
  };

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
      const url = await pushToTrello(project, tasks, (msg) => setSyncMsg(msg), {
        columns: selectedColumns,
        taskIds: selectedTaskIds,
      });
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
    <div className="at-side-panel" style={{ width: 360 }}>
      <div className="at-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0079BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Sync to Trello</span>
        </div>
        <button className="at-btn at-btn-ghost" onClick={onClose} style={{ padding: '8px', minWidth: 40, minHeight: 40 }} aria-label="Close Trello sync panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="at-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="at-form-group">
          <label className="at-label">Board Name</label>
          <input className="at-input" defaultValue={`${project.name} — AutoTrello`} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--at-primary)', marginBottom: 8 }}>Choose Lists</div>
          {columns.map(col => (
            <label key={col} className="at-sync-list-item" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedColumns.includes(col)} onChange={() => toggleColumn(col)} />
              <div className="at-sync-dot" style={{ background: getColColor(col) }} />
              <span style={{ fontSize: 13, color: '#CBD5E1' }}>{col}</span>
              <span className="at-sync-count">{tasks.filter(t => t.column === col).length} cards</span>
            </label>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--at-primary)', marginBottom: 8 }}>Choose Cards</div>
          <div className="at-sync-card-picker">
            {columns.map(col => (
              <div key={col} style={{ display: selectedColumns.includes(col) ? 'block' : 'none' }}>
                <div className="at-sync-column-label">{col}</div>
                {tasks.filter(t => t.column === col).sort(compareTasksByOrder).map(task => (
                  <label key={task.id} className="at-sync-card-row">
                    <input type="checkbox" checked={selectedTaskIds.includes(task.id)} onChange={() => toggleTask(task)} />
                    <span>{task.title}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[['Cards', selectedTasks.length], ['Subtasks', selectedTasks.reduce((a,t) => a + (t.subtasks?.length||0), 0)], ['Labels', [...new Set(selectedTasks.flatMap(t => t.labels||[]))].length]].map(([lbl, val]) => (
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

        <button className="at-btn at-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={handleSync} disabled={syncing || selectedTasks.length === 0}>
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
  const { onSidebarToggle, onOpenSettings } = useOutletContext<{ onSidebarToggle: () => void; onOpenSettings: (highlightMissing?: boolean) => void }>();
  const { addToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [srsCollapsed, setSrsCollapsed] = useState(true);
  const [showTrello, setShowTrello] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (over.data.current?.type === 'Column') {
      targetColumn = over.data.current.column as string;
    } else if (over.data.current?.type === 'Task') {
      targetColumn = (over.data.current.task as Task).column;
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) targetColumn = overTask.column;
    }

    if (!columns.includes(targetColumn)) return;

    if (activeTask.column !== targetColumn) {
      const updated = { ...activeTask, column: targetColumn, updated_at: new Date().toISOString() };
      setTasks(prev => prev.map(t => t.id === activeTask.id ? updated : t));
      await saveTask(updated);
      addToast(`Moved "${activeTask.title}" to ${targetColumn}`, 'success', 3000);
    }
  };

  if (!project) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 28px', borderBottom: '1px solid var(--at-border)' }}>
        <div className="at-skeleton" style={{ height: 20, width: 200 }} />
      </div>
      <div className="at-kanban-board">
        {[1, 2, 3, 4].map(col => (
          <div key={col} className="at-kanban-col">
            <div className="at-col-header">
              <div className="at-skeleton" style={{ height: 12, width: 80 }} />
              <div className="at-skeleton" style={{ height: 16, width: 24, borderRadius: 99 }} />
            </div>
            <div className="at-col-body">
              {[1, 2, 3].map(card => (
                <div key={card} className="at-skeleton-card">
                  <div className="at-skeleton at-skeleton-title" />
                  <div className="at-skeleton at-skeleton-desc" />
                  <div className="at-skeleton at-skeleton-badge" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const template = TEMPLATES[project.template];
  if (!template) return <div style={{ padding: 24, color: '#EF4444' }}>Invalid template</div>;
  const columns = project.custom_columns?.length ? project.custom_columns : template.columns;

  const handleExport = async () => {
    if (project) await exportProject(project.id);
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    await deleteProject(project.id);
    setShowDeleteConfirm(false);
    navigate('/projects');
  };

  const applyAgentActions = async (actions: BoardAgentAction[]) => {
    if (!project) return 0;

    let applied = 0;
    const now = new Date().toISOString();
    let nextTasks = [...tasks];

    for (const action of actions) {
      if (action.type === 'create_task') {
        const column = columns.includes(action.task.column || '') ? action.task.column as string : columns[0];
        const task: Task = {
          id: crypto.randomUUID(),
          project_id: project.id,
          title: action.task.title || 'Untitled',
          description: action.task.description || '',
          priority: action.task.priority || 'Medium',
          column,
          subtasks: action.task.subtasks || [],
          labels: action.task.labels || [],
          assignee: action.task.assignee || '',
          due_date: action.task.due_date || '',
          start_date: action.task.start_date || '',
          estimate: action.task.estimate || '',
          cover_color: action.task.cover_color || '',
          attachments: action.task.attachments || [],
          comments: action.task.comments || [],
          sort_order: Math.max(-1, ...nextTasks.map(t => t.sort_order ?? -1)) + 1,
          created_at: now,
          updated_at: now,
        };
        await saveTask(task);
        nextTasks = [...nextTasks, task];
        applied++;
      } else if (action.type === 'update_task') {
        const existing = nextTasks.find(t => t.id === action.task_id);
        if (!existing) continue;
        const patch = { ...action.patch };
        if (patch.column && !columns.includes(patch.column)) delete patch.column;
        const updated: Task = {
          ...existing,
          ...patch,
          priority: patch.priority || existing.priority,
          subtasks: patch.subtasks || existing.subtasks,
          labels: patch.labels || existing.labels,
          updated_at: now,
        };
        await saveTask(updated);
        nextTasks = nextTasks.map(t => t.id === updated.id ? updated : t);
        applied++;
      } else if (action.type === 'delete_task') {
        if (!nextTasks.some(t => t.id === action.task_id)) continue;
        await deleteTask(action.task_id);
        nextTasks = nextTasks.filter(t => t.id !== action.task_id);
        applied++;
      }
    }

    if (applied > 0) setTasks(nextTasks);
    return applied;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AppNavbar
        title={project.name}
        templateName={template.name || project.template}
        onSidebarToggle={onSidebarToggle}
        onOpenSettings={onOpenSettings}
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
        onDelete={() => setShowDeleteConfirm(true)}
        onSync={() => setShowTrello(true)}
      />

      {/* Tab bar */}
      <div className="at-tabbar">
        <button className="at-tab active">Kanban Board</button>
        <button className="at-tab" onClick={() => navigate('/project/new')}>Generate Backlog</button>
      </div>

      {/* Board + panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Kanban */}
        <div className="at-kanban-board" style={{ flex: isMobile && (showTrello || !srsCollapsed) ? '0 0 100%' : 1 }}>
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.column === col).sort(compareTasksByOrder);
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
                        assignee: '',
                        due_date: '',
                        start_date: '',
                        estimate: '',
                        cover_color: '',
                        attachments: [],
                        comments: [],
                        sort_order: Math.max(-1, ...tasks.map(t => t.sort_order ?? -1)) + 1,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      })}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                  <DroppableColumnBody column={col}>
                    <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {colTasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} onClick={() => setEditingTask(task)} />
                      ))}
                    </SortableContext>
                    
                    <button 
                      className="at-nav-item" 
                      style={{ 
                        marginTop: 4, 
                        border: '1px dashed rgba(184,247,212,0.18)', 
                        background: 'transparent',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 12,
                        minHeight: 36,
                        padding: '8px'
                      }}
                      onClick={() => setEditingTask({
                        id: crypto.randomUUID(),
                        project_id: project.id,
                        title: '',
                        description: '',
                        column: col,
                        priority: 'Medium',
                        subtasks: [],
                        labels: [],
                        assignee: '',
                        due_date: '',
                        start_date: '',
                        estimate: '',
                        cover_color: '',
                        attachments: [],
                        comments: [],
                        sort_order: Math.max(-1, ...tasks.map(t => t.sort_order ?? -1)) + 1,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      })}
                    >
                      + Add a card
                    </button>
                  </DroppableColumnBody>
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
            columns={columns}
            onAgentActions={applyAgentActions}
          />
        )}

        {/* Mobile overlay backdrop for side panels */}
        {isMobile && (showTrello || !srsCollapsed) && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 65,
            }}
            onClick={() => {
              if (showTrello) setShowTrello(false);
              else setSrsCollapsed(true);
            }}
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
            addToast('Card saved successfully', 'success');
          }}
          onDelete={async () => {
            await deleteTask(editingTask.id);
            setTasks(tasks.filter(t => t.id !== editingTask.id));
            setEditingTask(null);
            addToast('Card deleted', 'info');
          }}
          onPromote={async (title) => {
            const now = new Date().toISOString();
            const newTask: Task = {
              id: crypto.randomUUID(),
              project_id: project.id,
              title,
              description: `Promoted from subtask of: ${editingTask.title}`,
              column: editingTask.column,
              priority: 'Medium',
              subtasks: [],
              labels: [],
              assignee: '',
              due_date: '',
              start_date: '',
              estimate: '',
              sort_order: Math.max(-1, ...tasks.map(t => t.sort_order ?? -1)) + 1,
              created_at: now,
              updated_at: now
            };
            await saveTask(newTask);
            setTasks(prev => [...prev, newTask]);
          }}
        />
      )}

      {showDeleteConfirm && (
        <DeleteProjectDialog
          project={project}
          taskCount={tasks.length}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteProject}
        />
      )}
    </div>
  );
}
