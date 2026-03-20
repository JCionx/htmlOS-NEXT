import { ChevronLeft, Copy, Play } from "lucide-react";

interface ToolbarProps {
  title?: string;
  onSelectShowSidebar?: () => void;
  onCopy?: () => void;
  onRun?: () => void;
  hasAction?: boolean;
  expanded?: boolean;
  isMobile?: boolean;
}

function Toolbar({
  title,
  onSelectShowSidebar,
  onCopy,
  onRun,
  hasAction,
  expanded = false,
  isMobile,
}: ToolbarProps) {
  return (
    <div
      className={`toolbar ${expanded ? "toolbar-expanded" : ""} ${isMobile ? "toolbar-mobile" : ""}`}
    >
      <button onClick={onSelectShowSidebar} className="toolbar-btn sidebar-btn">
        <ChevronLeft
          size={isMobile ? 32 : 24}
          className={`sidebar-icon ${expanded ? "sidebar-icon-expanded" : ""}`}
        />
      </button>
      <h3 className="toolbar-title">{title}</h3>
      {hasAction && (
        <div className="toolbar-actions">
          <button onClick={onCopy} className="toolbar-btn">
            <Copy size={isMobile ? 24 : 18} />
          </button>
          <button onClick={onRun} className="toolbar-btn">
            <Play size={isMobile ? 24 : 18} />
          </button>
        </div>
      )}
      {!hasAction && <div></div>}
    </div>
  );
}

export default Toolbar;
