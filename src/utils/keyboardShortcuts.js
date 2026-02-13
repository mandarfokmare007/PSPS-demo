// Keyboard shortcuts hook for accessibility
import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!shortcuts) return;

      // Check for Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        shortcuts.onSave?.();
      }

      // Check for Ctrl+E (Export)
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        shortcuts.onExport?.();
      }

      // Check for Ctrl+M (Send to MET)
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        shortcuts.onSendToMET?.();
      }

      // Check for Alt+V (Toggle View)
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        shortcuts.onToggleView?.();
      }

      // Check for Alt+F (Toggle Filters)
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        shortcuts.onToggleFilters?.();
      }

      // Check for Escape (Close modal)
      if (e.key === 'Escape') {
        shortcuts.onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = [
  { keys: 'Ctrl+S', action: 'Save report and generate artifacts' },
  { keys: 'Ctrl+E', action: 'Export data (CSV, ETEC)' },
  { keys: 'Ctrl+M', action: 'Send overrides to MET' },
  { keys: 'Alt+V', action: 'Toggle view mode (All / Direct / Removed)' },
  { keys: 'Alt+F', action: 'Toggle filter panel' },
  { keys: 'Esc', action: 'Close modal or panel' },
];
