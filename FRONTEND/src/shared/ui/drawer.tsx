import { X } from "react-feather";

export function Drawer(open, onClose, title, placement = "right", children) {
  const placementClass =
    placement === "left"
      ? open
        ? "translate-x-0 left-0"
        : "-translate-x-full left-0"
      : open
      ? "translate-x-0 right-0"
      : "translate-x-full right-0";

  return (
    <>
      <div aria-hidden="true" onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 z-50 w-full max-w-sm bg-(--surface-1) border-l border-(--border-subtle) shadow-2xl transition-transform duration-200 flex flex-col ${placementClass}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--border-subtle)">
          <h3 className="font-semibold text-base text-(--text-primary)">{title || "Menu"}</h3>
          <button type="button" aria-label="Fechar menu" className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto text-(--text-primary)">
          {children}
        </div>
      </aside>
    </>
  );
}
