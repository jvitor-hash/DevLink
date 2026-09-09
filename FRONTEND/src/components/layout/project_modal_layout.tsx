import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function ProjectModal() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const params = new URLSearchParams(search);
  const modal = params.get("modal");
  const projectId = params.get("id");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modal === "project" && !dialog.open) dialog.showModal();
    if (modal !== "project" && dialog.open) dialog.close();
  }, [modal]);

  function closeModal() {
    params.delete("modal");
    params.delete("id");
    const query = params.toString();
    navigate(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <>
      <div onClick={closeModal} className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity ${modal === "project" ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <dialog ref={dialogRef} onCancel={closeModal} className="bg-(--surface-1) m-auto text-white rounded-md p-6 min-w-6xl">
        <h2 className="text-2xl">Project {projectId ?? "null"}</h2>
        <p>Project modal content</p>
        <button onClick={closeModal}>Close</button>
      </dialog>
    </>
  );
}
