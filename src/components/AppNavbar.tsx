import { useState, useRef, useEffect } from 'react';
import { MenuIcon, UploadIcon, DownloadIcon, GridIcon, ZapIcon, TrashIcon, GearIcon, MoreVerticalIcon } from '@/lib/icons';
import { Link } from 'react-router-dom';

export function AppNavbar({
  title,
  templateName,
  onSidebarToggle,
  onOpenSettings,
  onExport,
  onImport,
  onSync,
  onDelete,
  hideActions = false
}: {
  title: string;
  templateName?: string;
  onSidebarToggle: () => void;
  onOpenSettings?: (highlightMissing?: boolean) => void;
  onExport?: () => void;
  onImport?: () => void;
  onSync?: () => void;
  onDelete?: () => void;
  hideActions?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleAction = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="at-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        <button className="at-btn at-btn-ghost at-navbar-menu-btn" onClick={onSidebarToggle} style={{ padding: '6px 8px', borderRadius: 8, flexShrink: 0 }}>
          <MenuIcon size={20} />
        </button>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ flexShrink: 0 }}><ZapIcon size={18} /></span>
          <span className="at-navbar-title" style={{ color: '#fff', fontWeight: 700 }} title={title}>{title}</span>
        </Link>
      </div>

      {templateName && (
        <div className="at-template-pill">
          <span style={{ opacity: 0.5 }}>Template:</span>
          <span style={{ color: '#fff' }}>{templateName}</span>
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Mobile settings button */}
        {onOpenSettings && (
          <button
            className="at-btn at-btn-ghost at-navbar-settings"
            onClick={() => onOpenSettings()}
            title="Settings"
            style={{ padding: '6px 8px', borderRadius: 8 }}
          >
            <GearIcon size={20} />
          </button>
        )}

        {!hideActions && (
          <>
            {/* Desktop: show all buttons */}
            <div className="at-navbar-actions-desktop">
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

            {/* Mobile: more menu */}
            <div className="at-navbar-actions-mobile" ref={menuRef}>
              {onSync && (
                <button className="at-btn at-btn-primary at-btn-icon-only" onClick={onSync} title="Sync to Trello" style={{ padding: '8px', borderRadius: 8 }}>
                  <GridIcon size={18} color="#fff" />
                </button>
              )}
              <button
                className="at-btn at-btn-ghost at-btn-icon-only"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                title="More actions"
                style={{ padding: '8px', borderRadius: 8 }}
              >
                <MoreVerticalIcon size={18} />
              </button>

              {mobileMenuOpen && (
                <div className="at-mobile-dropdown">
                  {onImport && (
                    <button className="at-mobile-dropdown-item" onClick={() => handleAction(onImport)}>
                      <UploadIcon size={16} />
                      <span>Import</span>
                    </button>
                  )}
                  {onExport && (
                    <button className="at-mobile-dropdown-item" onClick={() => handleAction(onExport)}>
                      <DownloadIcon size={16} />
                      <span>Export</span>
                    </button>
                  )}
                  {onDelete && (
                    <button className="at-mobile-dropdown-item at-mobile-dropdown-item-danger" onClick={() => handleAction(onDelete)}>
                      <TrashIcon size={16} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
