import { useState, type ChangeEvent, type CSSProperties } from 'react';
import type { Task } from '@/lib/db';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;

const BADGE_STYLE: Record<string, CSSProperties> = {
  Critical: { background: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  High:     { background: 'rgba(249,115,22,0.15)', color: '#F97316' },
  Medium:   { background: 'rgba(234,179,8,0.15)',  color: '#EAB308' },
  Low:      { background: 'rgba(34,197,94,0.15)',  color: '#22C55E' },
};

export function TaskEditModal({
  task, columns, onClose, onSave, onDelete,
}: {
  task: Task;
  columns: string[];
  onClose: () => void;
  onSave: (t: Task) => void;
  onDelete?: () => void;
}) {
  const [edited, setEdited] = useState<Task>({ ...task });
  const [newSubtask, setNewSubtask] = useState('');
  const [checkedSubs, setCheckedSubs] = useState<Record<number, boolean>>(
    Object.fromEntries(task.subtasks?.map((_, i) => [i, i < Math.floor((task.subtasks?.length ?? 0) / 2)]) ?? [])
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEdited(p => ({ ...p, [name]: value }));
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setEdited(p => ({ ...p, subtasks: [...(p.subtasks ?? []), newSubtask.trim()] }));
    setNewSubtask('');
  };

  const removeLabel = (lbl: string) => setEdited(p => ({ ...p, labels: p.labels?.filter(l => l !== lbl) }));

  const createdDate = new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const updatedDate = new Date(task.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="at-modal-backdrop" onClick={onClose}>
      <div className="at-modal" style={{ width: 720, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="at-modal-header">
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            TASK-{task.id.slice(0, 5).toUpperCase()}
          </span>
          <button className="at-btn at-btn-ghost" onClick={onClose} style={{ padding: '4px 8px' }}>✕</button>
        </div>

        {/* Split body */}
        <div className="at-task-split">
          {/* Main */}
          <div className="at-task-main">
            <input
              className="at-task-title-input"
              name="title"
              value={edited.title}
              onChange={handleChange}
              placeholder="Task title"
            />

            <div style={{ marginBottom: 20 }}>
              <span className="at-section-label">Description</span>
              <textarea
                className="at-textarea"
                name="description"
                value={edited.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add a description…"
              />
            </div>

            <div>
              <span className="at-section-label">Sub-tasks</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                {(edited.subtasks ?? []).map((sub, i) => (
                  <div key={i} className={`at-checklist-item${checkedSubs[i] ? ' done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!checkedSubs[i]}
                      onChange={e => setCheckedSubs(c => ({ ...c, [i]: e.target.checked }))}
                    />
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="at-input"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  placeholder="+ Add sub-task"
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                  style={{ flex: 1 }}
                />
                <button className="at-btn at-btn-primary" onClick={addSubtask} style={{ padding: '0 14px' }}>Add</button>
              </div>
            </div>
          </div>

          {/* Meta sidebar */}
          <div className="at-task-meta">
            <div className="at-meta-item">
              <div className="at-meta-label">Priority</div>
              <select name="priority" value={edited.priority} onChange={handleChange} className="at-select" style={{ marginTop: 4 }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ marginTop: 6 }}>
                <span style={{ ...BADGE_STYLE[edited.priority], fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                  {edited.priority}
                </span>
              </div>
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Column / Status</div>
              <select name="column" value={edited.column} onChange={handleChange} className="at-select" style={{ marginTop: 4 }}>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Labels</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                {(edited.labels ?? []).map(lbl => (
                  <span key={lbl} className="at-tag" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => removeLabel(lbl)}>
                    {lbl} <span style={{ fontSize: 10 }}>×</span>
                  </span>
                ))}
                <span className="at-tag" style={{ cursor: 'pointer', color: '#2563EB', border: '1px dashed #2563EB' }}>+ Label</span>
              </div>
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Created</div>
              <div className="at-meta-value" style={{ fontSize: 12, marginTop: 3 }}>{createdDate}</div>
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Last Updated</div>
              <div className="at-meta-value" style={{ fontSize: 12, marginTop: 3 }}>{updatedDate}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="at-modal-footer">
          {onDelete && (
            <button className="at-btn at-btn-danger-ghost" onClick={onDelete} style={{ marginRight: 'auto' }}>
              Delete Task
            </button>
          )}
          <button className="at-btn at-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="at-btn at-btn-primary"
            onClick={() => onSave({ ...edited, updated_at: new Date().toISOString() })}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
