import { useEffect, type ReactNode } from "react";
import { X } from "react-feather";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Drawer({ open, onClose, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-transparent transition-opacity ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-md bg-(--surface-1)/25 backdrop-blur-md transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end p-4">
          <button type="button" aria-label="Fechar menu" className="cursor-pointer" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <hr />

        <div className="flex flex-col gap-4 p-4 text-(--text-primary)">
          {children}
        </div>
      </aside>
    </>
  );
}
