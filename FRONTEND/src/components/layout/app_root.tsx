import { Outlet, useNavigation } from "react-router-dom";

import { NavbarLayout } from "@/components/layout/navbar_layout";
import SmoothScroll from "@/components/ui/smooth_scroll_component";
import LoadingScreen from "@/pages/loading";

export function RootApp() : React.ReactElement {
  const navigation = useNavigation();

  const isLoading = navigation.state !== "idle";

  return (
    <>
      {isLoading && <LoadingScreen />}
      <NavbarLayout />
      <SmoothScroll />
      <Outlet />
    </>
  );
}
