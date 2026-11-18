import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

// Root
import UIRoot from "@/shared/ui/ui_root";

// Route feedback pages
import ErrorPage from "@/pages/status/error";
import LoadingScreen from "@/pages/status/loading";
import ProtectedRoute from "@/pages/status/protected_route";

// All the views available
const HomePage = lazy(() => import("@/pages/home"));
const ProjectsPage = lazy(() => import("@/pages/projects"));
const ProjectOpenPage = lazy(() => import("@/pages/project_open"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const NotificationPage = lazy(() => import("@/pages/notification_center"));
const QuestionnairePage = lazy(() => import("@/pages/questionaire"));
const ContactPage = lazy(() => import("@/pages/contact"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UIRoot />,
    errorElement: <ErrorPage error="Erro ao carregar a página." />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "contact",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ContactPage />
          </Suspense>
        ),
      },

      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "project",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProjectsPage />
              </Suspense>
            ),
          },
          {
            path: "project/open/:projectId",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProjectOpenPage />
              </Suspense>
            ),
          },
          {
            path: "questionaire",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <QuestionnairePage />
              </Suspense>
            ),
          },
          {
            path: "notification",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <NotificationPage />
              </Suspense>
            ),
          },
          {
            path: "settings",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SettingsPage />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: "profile/:profileId",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
