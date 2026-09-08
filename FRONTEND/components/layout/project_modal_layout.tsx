"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ProjectModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modal = searchParams.get("modal");
  const projectId = searchParams.get("id");

  const isOpen = modal === "project";

  function closeModal() {
    const params = new URLSearchParams(searchParams);
    params.delete("modal");
    params.delete("id");

    const query = params.toString();

    router.push(`${pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <dialog open>
      <h2>Project {projectId}</h2>

      <p>Project modal content</p>

      <button onClick={closeModal}>
        Close
      </button>
    </dialog>
  );
}
