import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/router";
import "@/assets/global.css";
import { initializeTheme, applyTheme } from "@/utils/theme_flag";

// Restores the persisted theme before the first paint; defaults to the
// original look when nothing is stored.
initializeTheme();

// Rollback switch: `devlinkTheme("default")` restores the original look,
// `devlinkTheme("glass-brutal")` re-enables it. The choice is persisted.
Object.assign(window, { devlinkTheme: applyTheme });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
