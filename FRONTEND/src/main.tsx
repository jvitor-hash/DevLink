import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./global.css";
import App from "./app.tsx";
import Navbar from "./components/layout/navbar_layout";
import SmoothScroll from "./components/ui/smooth_scroll_component";
import ProjectPage from "./pages/project";
import ProfilePage from "./pages/profile";
import SettingsPage from "./pages/settings";
import NotificationPage from "./pages/notification";
import ErrorPage from "./pages/error";
import ErrorBoundary from "./components/layout/error_boundary.tsx";
import { ProtectedRoute } from "./components/misc/protected_route.tsx";

// Layout component that wraps all routes
const Layout = () => (
  <>
    <Navbar />
    <SmoothScroll />
    <Outlet />
  </>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />} errorElement={<ErrorPage />}>
            <Route path="/" element={<App />} />
            <Route path="/project" element={<ProjectPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/notification" element={<NotificationPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
