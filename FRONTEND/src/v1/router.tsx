import { Suspense, lazy } from "react";
import { createBrowserRouter, type LoaderFunctionArgs } from "react-router-dom";

import { RootApp } from "@/components/ui/app_root";
import { ProtectedRoute } from "@/components/routing/protected_route";
import RouteFallback from "@/components/ui/route_fallback";
import ErrorPage from "@/pages/error";

// Every page and its loader are code-split: they load on demand.
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
