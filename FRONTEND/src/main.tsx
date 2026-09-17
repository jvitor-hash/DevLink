import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppLayout } from "@/components/layout/app_layout";
import ErrorBoundary from "@/components/layout/error_boundary";
import { ProtectedRoute } from "@/components/routing/protected_route";
import "@/global.css";

import HomePage from "@/pages/home";
import ProjectPage from "@/pages/project";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import NotificationPage from "@/pages/notification";
import QuestionnairePage from "@/pages/questionnaire";
import ErrorPage from "@/pages/error";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<AppLayout />} errorElement={<ErrorPage />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/project" element={<ProjectPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/notification" element={<NotificationPage />} />
              <Route path="/questionnaire" element={<QuestionnairePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
