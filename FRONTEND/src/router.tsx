import { Suspense, lazy } from "react";
import { createBrowserRouter, type LoaderFunctionArgs } from "react-router-dom";

import { RootApp } from "@/components/ui/app_root";
import { ProtectedRoute } from "@/components/routing/protected_route";
import RouteFallback from "@/components/ui/route_fallback";
import ErrorPage from "@/pages/error";

// Every page and its loader are code-split: they load on demand.
const HomePage = lazy(() => import("@/pages/home/home"));
const MangaStorePage = lazy(() => import("@/pages/manga_store/manga_store"));
const ProjectPage = lazy(() => import("@/pages/project/project"));
const ProjectOpenPage = lazy(() => import("@/pages/project_open/project_open"));
const ProfilePage = lazy(() => import("@/pages/profile/profile"));
const SettingsPage = lazy(() => import("@/pages/settings/settings"));
const NotificationPage = lazy(() => import("@/pages/notification_center/notification"));
const QuestionnairePage = lazy(() => import("@/pages/questionnaire/questionnaire"));

const deferred = (node: React.ReactNode) => <Suspense fallback={<RouteFallback />}>{node}</Suspense>;

// Loaders stay on the route definitions so navigation keeps its data contract,
// but the module behind them is only fetched when the route is visited.
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootApp />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: deferred(<HomePage />) },
      { path: "store", element: deferred(<MangaStorePage />) },
      {
        path: "project",
        loader: (args: LoaderFunctionArgs) => import("@/pages/project/project").then((module) => module.ProjectLoader(args)),
        element: deferred(<ProjectPage />),
      },

      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "notification",
            element: deferred(<NotificationPage />),
          },

          {
            path: "questionnaire",
            element: deferred(<QuestionnairePage />),
          },

          {
            path: "settings",
            loader: () => import("@/pages/settings/settings").then((module) => module.SettingsLoader()),
            element: deferred(<SettingsPage />),
          },

          {
            path: "profile",
            loader: () => import("@/pages/profile/profile").then((module) => module.ProfileSelfLoader()), // The current signed-in user.
            element: deferred(<ProfilePage />),
          },

          {
            path: "profile/:userId",
            loader: (args: LoaderFunctionArgs) => import("@/pages/profile/profile").then((module) => module.ProfileOtherLoader(args)), // Other user pages
            element: deferred(<ProfilePage />),
          },

          {
            path: "project/open/:projectId",
            loader: (args: LoaderFunctionArgs) => import("@/pages/project_open/project_open").then((module) => module.ProjectOpenLoader(args)),
            element: deferred(<ProjectOpenPage />),
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
