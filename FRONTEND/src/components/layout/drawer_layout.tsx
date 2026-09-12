import { useEffect } from "react";
import { X } from "react-feather";

type DrawerProps = {
  open: boolean,
  onClose: () => void,
  children: React.ReactNode;
}
export default function Drawer({ open, onClose, children }: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-transparent transition-opacity
          ${open ?
            "pointer-events-auto opacity-100" :
            "pointer-events-none opacity-0"}`}
        />

      {/* Drawer */}
      <aside
        className={`fixed inset-0 z-40 bg-(--surface-1)/25 backdrop-blur-md transition-transform max-w-md
          ${open ? "translate-x-0" :
                   "-translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-end p-4">
          <button className="hover:cursor-pointer" onClick={onClose}>
            <X size={24}/>
          </button>
        </div>

        <hr className="border-t-(--primary)"/>

        {/* Content */}
        <div className="flex flex-col gap-4 p-4 text-white">
          {children}
        </div>
      </aside>
    </>
  )
}
