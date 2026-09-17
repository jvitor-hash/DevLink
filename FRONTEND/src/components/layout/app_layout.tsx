import { Outlet } from "react-router-dom";

import { NavbarLayout } from "@/components/layout/navbar_layout";
import SmoothScroll from "@/components/ui/smooth_scroll_component";

// Route layout that wraps all pages
export function AppLayout() : React.ReactElement {
  return (
    <>
      <NavbarLayout />
      <SmoothScroll />
      <Outlet />
    </>
  );
}
