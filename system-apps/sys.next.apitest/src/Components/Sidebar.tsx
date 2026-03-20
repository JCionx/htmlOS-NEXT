interface SidebarProps {
  open: boolean;
  actions: Array<{ id: string; title: string }>;
  onSelectAction: (actionId: string) => void;
  selectedActionId?: string;
  isMobile?: boolean;
}

function Sidebar({
  open,
  actions,
  onSelectAction,
  selectedActionId,
  isMobile,
}: SidebarProps) {
  return (
    <div
      className={`sidebar ${open ? "" : "sidebar-collapsed"} ${
        isMobile ? "sidebar-mobile" : ""
      } ${!open && isMobile ? "sidebar-mobile-hidden" : ""}`}
    >
      <h2 className="sidebar-separator">API Actions</h2>
      <div className="sidebar-list">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`sidebar-item ${selectedActionId === action.id ? "selected" : ""}`}
            onClick={() => onSelectAction(action.id)}
          >
            <div>{action.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
