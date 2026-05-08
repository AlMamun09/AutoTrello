import type { Project } from '@/lib/db';
import { TrashIcon } from '@/lib/icons';

export function DeleteProjectDialog({
  project,
  taskCount,
  onCancel,
  onConfirm,
}: {
  project: Project;
  taskCount?: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="at-modal-backdrop" onClick={onCancel}>
      <div className="at-modal at-confirm-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="delete-project-title">
        <div className="at-confirm-hero">
          <div className="at-confirm-icon">
            <TrashIcon size={24} />
          </div>
          <div>
            <div className="at-section-label">Permanent action</div>
            <h2 id="delete-project-title">Delete this project?</h2>
            <p>
              This will permanently delete <strong>{project.name}</strong>
              {typeof taskCount === 'number' ? ` and ${taskCount} task${taskCount === 1 ? '' : 's'}` : ' and all of its tasks'}.
            </p>
          </div>
        </div>

        <div className="at-confirm-warning">
          This action cannot be undone. Export the project first if you need a backup.
        </div>

        <div className="at-modal-footer">
          <button className="at-btn at-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="at-btn at-btn-danger" onClick={onConfirm}>
            <TrashIcon size={16} />
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}
