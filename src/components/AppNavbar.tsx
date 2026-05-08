import { MenuIcon, UploadIcon, DownloadIcon, GridIcon, ZapIcon, TrashIcon } from '@/lib/icons';
import { Link } from 'react-router-dom';

export function AppNavbar({
  title,
  templateName,
  onSidebarToggle,
  onExport,
  onImport,
  onSync,
  onDelete,
  hideActions = false
}: {
  title: string;
  templateName?: string;
  onSidebarToggle: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSync?: () => void;
  onDelete?: () => void;
  hideActions?: boolean;
}) {
  return (
    <header className="at-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="at-btn at-btn-ghost" onClick={onSidebarToggle} style={{ padding: '6px 8px', borderRadius: 8 }}>
          <MenuIcon size={20} />
        </button>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ZapIcon size={18} />
          <span className="at-navbar-title" style={{ color: '#fff', fontWeight: 700 }}>{title}</span>
        </Link>
      </div>

      {templateName && (
        <div className="at-template-pill">
          <span style={{ opacity: 0.5 }}>Template:</span>
          <span style={{ color: '#fff' }}>{templateName}</span>
          {/* <ChevronDown size={10} /> */}
        </div>
      )}

      {!hideActions && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {onImport && (
            <button className="at-btn at-btn-ghost" onClick={onImport} title="Import project from JSON">
              <UploadIcon size={16} />
              <span className="btn-label">Import</span>
            </button>
          )}
          {onExport && (
            <button className="at-btn at-btn-ghost" onClick={onExport} title="Export project as JSON">
              <DownloadIcon size={16} />
              <span className="btn-label">Export</span>
            </button>
          )}
          {onDelete && (
            <button className="at-btn at-btn-danger-ghost" onClick={onDelete} title="Delete project">
              <TrashIcon size={16} />
              <span className="btn-label">Delete</span>
            </button>
          )}
          {onSync && (
            <button className="at-btn at-btn-primary" onClick={onSync} style={{ marginLeft: 6, padding: '7px 16px' }}>
              <GridIcon size={16} color="#fff" />
              <span>Sync to Trello</span>
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .btn-label { display: none; }
          .at-template-pill { display: none; }
        }
      `}</style>
    </header>
  );
}
