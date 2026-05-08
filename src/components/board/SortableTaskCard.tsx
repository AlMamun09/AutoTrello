import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/lib/db';

const PRIORITY_BORDER: Record<string, string> = {
  Critical: '#FB7185',
  High:     '#FDBA74',
  Medium:   '#FDE68A',
  Low:      '#B8F7D4',
};

export function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderLeftColor: PRIORITY_BORDER[task.priority] ?? PRIORITY_BORDER.Medium,
    borderTopColor: task.cover_color || undefined,
  };

  // Derive a short module/tag from labels
  const tag = task.labels?.[0] ?? '';

  // Initials from title words for avatar
  const words = task.title.trim().split(' ');
  const initials = words.length >= 2 ? words[0][0] + words[1][0] : words[0].slice(0, 2);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="at-card"
      data-priority={task.priority}
    >
      {task.cover_color && <div className="at-card-mini-cover" style={{ background: task.cover_color }} />}
      <div className="at-card-title">{task.title}</div>
      {task.description && (
        <div className="at-card-desc">{task.description}</div>
      )}
      <div className="at-card-footer">
        <span className={`at-badge at-badge-${task.priority}`}>{task.priority}</span>
        {tag && <span className="at-tag">{tag}</span>}
        {task.due_date && <span className="at-tag">Due {task.due_date}</span>}
        {task.estimate && <span className="at-tag">{task.estimate}</span>}
        {task.subtasks?.length > 0 && (
          <span className="at-tag" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            {task.subtasks.length}
          </span>
        )}
        {task.attachments?.length ? <span className="at-tag">{task.attachments.length} links</span> : null}
        <div className="at-avatar-sm" style={{ marginLeft: tag ? undefined : 'auto' }} title={task.title}>
          {(task.assignee ? task.assignee.slice(0, 2) : initials).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
