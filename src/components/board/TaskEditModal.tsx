import { useState, type ChangeEvent } from 'react';
import type { Task } from '@/lib/db';
import { CustomSelect } from '@/components/ui/CustomSelect';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
const COVER_COLORS = ['#7DD3FC', '#B8F7D4', '#FDBA74', '#FDE68A', '#C4B5FD', '#FB7185'];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function TaskEditModal({
  task, columns, onClose, onSave, onDelete, onPromote,
}: {
  task: Task;
  columns: string[];
  onClose: () => void;
  onSave: (t: Task) => void;
  onDelete?: () => void;
  onPromote?: (title: string) => void;
}) {
  const [edited, setEdited] = useState<Task>({
    ...task,
    subtasks: task.subtasks ?? [],
    labels: task.labels ?? [],
    attachments: task.attachments ?? [],
    comments: task.comments ?? [],
  });
  const [newSubtask, setNewSubtask] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newAttachment, setNewAttachment] = useState('');
  const [newComment, setNewComment] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEdited(p => ({ ...p, [name]: value }));
  };

  const addSubtask = () => {
    const value = newSubtask.trim();
    if (!value) return;
    setEdited(p => ({ ...p, subtasks: [...(p.subtasks ?? []), value] }));
    setNewSubtask('');
  };

  const removeSubtask = (index: number) => {
    setEdited(p => ({ ...p, subtasks: (p.subtasks ?? []).filter((_, i) => i !== index) }));
  };

  const addLabel = () => {
    const value = newLabel.trim();
    if (!value || edited.labels?.includes(value)) return;
    setEdited(p => ({ ...p, labels: [...(p.labels ?? []), value] }));
    setNewLabel('');
  };

  const removeLabel = (label: string) => {
    setEdited(p => ({ ...p, labels: (p.labels ?? []).filter(l => l !== label) }));
  };

  const addAttachment = () => {
    const value = normalizeUrl(newAttachment);
    if (!value) return;
    setEdited(p => ({ ...p, attachments: [...(p.attachments ?? []), value] }));
    setNewAttachment('');
  };

  const addComment = () => {
    const value = newComment.trim();
    if (!value) return;
    setEdited(p => ({ ...p, comments: [...(p.comments ?? []), value] }));
    setNewComment('');
  };

  const createdDate = new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const updatedDate = new Date(task.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="at-modal-backdrop" onClick={onClose}>
      <div className="at-modal at-task-modal" onClick={e => e.stopPropagation()}>
        <div className="at-card-cover" style={{ background: edited.cover_color || 'linear-gradient(135deg, rgba(184,247,212,0.5), rgba(125,211,252,0.55))' }} />

        <div className="at-modal-header">
          <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--at-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            CARD-{task.id.slice(0, 5).toUpperCase()}
          </span>
          <button className="at-btn at-btn-ghost" onClick={onClose} style={{ padding: '4px 8px' }}>x</button>
        </div>

        <div className="at-task-split">
          <div className="at-task-main">
            <span className="at-section-label">Task</span>
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
                placeholder="Add details, acceptance criteria, or context..."
              />
            </div>

            <div className="at-detail-section">
              <span className="at-section-label">Checklist / Subtasks</span>
              <div className="at-checklist-list">
                {(edited.subtasks ?? []).map((sub, i) => (
                  <div key={`${sub}-${i}`} className="at-checklist-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <input type="checkbox" style={{ cursor: 'pointer' }} />
                      <span style={{ fontSize: 13 }}>{sub}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {onPromote && (
                        <button 
                          className="at-btn at-btn-ghost" 
                          style={{ fontSize: 10, padding: '2px 6px', height: 22, color: 'var(--at-primary)' }}
                          onClick={() => {
                            onPromote(sub);
                            removeSubtask(i);
                          }}
                        >
                          Promote
                        </button>
                      )}
                      <button 
                        className="at-btn at-btn-ghost" 
                        style={{ fontSize: 10, padding: '2px 6px', height: 22, color: 'var(--at-critical)' }}
                        onClick={() => removeSubtask(i)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="at-inline-add">
                <input
                  className="at-input"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  placeholder="Add subtask after defining the main task"
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                />
                <button className="at-btn at-btn-primary" onClick={addSubtask}>Add</button>
              </div>
            </div>

            <div className="at-detail-section">
              <span className="at-section-label">Attachments</span>
              <div className="at-attachment-list">
                {(edited.attachments ?? []).map(url => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                ))}
              </div>
              <div className="at-inline-add">
                <input
                  className="at-input"
                  value={newAttachment}
                  onChange={e => setNewAttachment(e.target.value)}
                  placeholder="Add URL attachment"
                  onKeyDown={e => e.key === 'Enter' && addAttachment()}
                />
                <button className="at-btn at-btn-secondary" onClick={addAttachment}>Attach</button>
              </div>
            </div>

            <div className="at-detail-section">
              <span className="at-section-label">Activity / Comments</span>
              <div className="at-comment-list">
                {(edited.comments ?? []).map((comment, i) => (
                  <div key={`${comment}-${i}`} className="at-comment">{comment}</div>
                ))}
              </div>
              <textarea
                className="at-textarea"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={2}
                placeholder="Write a comment..."
              />
              <button className="at-btn at-btn-secondary" onClick={addComment} style={{ marginTop: 8 }}>Add Comment</button>
            </div>
          </div>

          <div className="at-task-meta">
            <div className="at-meta-item">
              <div className="at-meta-label">Status / List</div>
              <CustomSelect 
                value={edited.column} 
                options={columns} 
                onChange={(val) => setEdited(p => ({ ...p, column: val }))} 
              />
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Priority</div>
              <CustomSelect 
                value={edited.priority} 
                options={[...PRIORITIES]} 
                onChange={(val) => setEdited(p => ({ ...p, priority: val as any }))} 
              />
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Assignee</div>
              <input className="at-input" name="assignee" value={edited.assignee ?? ''} onChange={handleChange} placeholder="Owner name" />
            </div>

            <div className="at-meta-grid">
              <div className="at-meta-item">
                <div className="at-meta-label">Start</div>
                <input className="at-input" name="start_date" type="date" value={edited.start_date ?? ''} onChange={handleChange} />
              </div>
              <div className="at-meta-item">
                <div className="at-meta-label">Due</div>
                <input className="at-input" name="due_date" type="date" value={edited.due_date ?? ''} onChange={handleChange} />
              </div>
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Estimate</div>
              <input className="at-input" name="estimate" value={edited.estimate ?? ''} onChange={handleChange} placeholder="2h, 3d, 1 sprint" />
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Cover</div>
              <div className="at-cover-picker">
                {COVER_COLORS.map(color => (
                  <button
                    key={color}
                    style={{ background: color, outline: edited.cover_color === color ? '2px solid white' : undefined }}
                    onClick={() => setEdited(p => ({ ...p, cover_color: color }))}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Labels</div>
              <div className="at-label-list">
                {(edited.labels ?? []).map(lbl => (
                  <button key={lbl} className="at-tag" onClick={() => removeLabel(lbl)} title="Remove label">
                    {lbl} x
                  </button>
                ))}
              </div>
              <div className="at-inline-add compact">
                <input
                  className="at-input"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="New label"
                  onKeyDown={e => e.key === 'Enter' && addLabel()}
                />
                <button className="at-btn at-btn-secondary" onClick={addLabel}>Add</button>
              </div>
            </div>

            <div className="at-meta-item">
              <div className="at-meta-label">Created</div>
              <div className="at-meta-value">{createdDate}</div>
            </div>
            <div className="at-meta-item">
              <div className="at-meta-label">Updated</div>
              <div className="at-meta-value">{updatedDate}</div>
            </div>
          </div>
        </div>

        <div className="at-modal-footer">
          {onDelete && (
            <button className="at-btn at-btn-danger-ghost" onClick={onDelete} style={{ marginRight: 'auto' }}>
              Delete Card
            </button>
          )}
          <button className="at-btn at-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="at-btn at-btn-primary"
            onClick={() => onSave({ ...edited, updated_at: new Date().toISOString() })}
          >
            Save Card
          </button>
        </div>
      </div>
    </div>
  );
}
