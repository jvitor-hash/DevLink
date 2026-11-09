import { useEffect, useState } from "react";
import { Outlet, useNavigation } from "react-router-dom";

import { NavbarLayout } from "@/components/ui/navbar_layout";
import SmoothScroll from "@/components/ui/smooth_scroll_component";
import LoadingScreen from "@/pages/loading";
import Toaster from "@/components/ui/toaster_component";
import ProjectEventsToaster from "@/components/ui/project_events_toaster";
import LoginModal from "@/components/ui/login_modal";
import { registerUnauthorizedHandler } from "@/utils/api_client";
import { toastStore } from "@/utils/toast_store";
import { userSingleton } from "@/context/user";

export function RootApp() : React.ReactElement {
  const navigation = useNavigation();

  const isLoading = navigation.state !== "idle";

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Any 401 outside the auth endpoints means the session died server-side:
  // drop the cached identity and ask for credentials again.
  useEffect(() => registerUnauthorizedHandler(() => {
    if (!userSingleton.isSignedIn) return;

    userSingleton.clearSession();

    toastStore.info("Sua sessão expirou. Entre novamente para continuar.");
    setIsLoginModalOpen(true);
  }), []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <NavbarLayout onOpenLogin={() => setIsLoginModalOpen(true)} />
      <SmoothScroll />
      <Outlet />
      <ProjectEventsToaster />
      <Toaster />
      <LoginModal show={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
