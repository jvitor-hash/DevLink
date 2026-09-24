import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/app_layout";
import { ProtectedRoute } from "@/components/routing/protected_route";
import "@/global.css";

import HomePage from "@/pages/home";
import ProjectPage from "@/pages/project";
import ProjectOpenPage, { ProjectOpenLoader } from "@/pages/project_open/project_open";
import ProfilePage, { ProfileOtherLoader, ProfileSelfLoader } from "@/pages/profile";
import SettingsPage, { SettingsLoader } from "@/pages/settings/settings";
import NotificationPage, { NotificationLoader } from "@/pages/notification";
import QuestionnairePage from "@/pages/questionnaire/questionnaire";
import ErrorPage from "@/pages/error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "project", element: <ProjectPage /> },

      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "notification",
            loader: NotificationLoader,
            element: <NotificationPage />
          },

          {
            path: "questionnaire",
            element: <QuestionnairePage />
          },

          {
            path: "settings",
            loader: SettingsLoader,
            element: <SettingsPage />
          },

          {
            path: "profile",
            loader: ProfileSelfLoader, // The current signed-in user.
            element: <ProfilePage />
          },

          {
            path: "profile/:userId",
            loader: ProfileOtherLoader, // Other user pages
            element: <ProfilePage />
          },

          {
            path: "project/open/:projectId",
            loader: ProjectOpenLoader,
            element: <ProjectOpenPage />
          },
        ],
      },

      // 404: throw so it flows through the same errorElement — no duplicate ErrorPage usage
      {
        path: "*",
        loader: () => {
          throw new Response("Página não encontrada", { status: 404 });
        },
      },
    ],
  },
]);


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
