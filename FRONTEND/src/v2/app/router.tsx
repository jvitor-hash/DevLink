import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

// Root
import UIRoot from "@/shared/ui/ui_root";

// Route feedback pages
import ErrorPage from "@/pages/status/error";
import LoadingScreen from "@/pages/status/loading";
import ProtectedRoute from "@/pages/status/protected_route";

// All the views available
const HomePage = lazy(() => import("@/pages/home/home"));
const ProjectPage = lazy(() => import("@/pages/project/project"));
const ProjectOpenPage = lazy(() => import("@/pages/project_open/project_open"));
const ProfilePage = lazy(() => import("@/pages/profile/profile"));
const SettingsPage = lazy(() => import("@/pages/settings/settings"));
const NotificationPage = lazy(() => import("@/pages/notification_center/notification"));
const QuestionnairePage = lazy(() => import("@/pages/questionnaire/questionnaire"));

export const router = createBrowserRouter([
    {
        "path": "/",
        element: <UIRoot/>,
        errorElement: <ErrorPage/>,
        children=[
            { index: true, element: <HomePage/> },

            // Protected Routes
            {
                element: <ProtectedRoute/>,
                children: [
                    {
                        path: "project",
                        loader: undefined,
                        element: <ProjectPage/>
                    },

                    {
                        path: "project/open/:projectId",
                        loader: undefined,
                        element: <ProjectOpenPage/>
                    },

                    {
                        path: "questionaire",
                        loader: undefined,
                        element: <QuestionnairePage/>
                    },

                    {
                        path: "notification",
                        loader: undefined,
                        element: <NotificationPage/>
                    },

                    {
                        path: "settings",
                        loader: undefined,
                        element: <SettingsPage/>
                    },

                    {
                        path: "profile",
                        loader: undefined,
                        element: <ProfilePage/>
                    },

                    {
                        path: "profile/:profileId",
                        loader: undefined,
                        element: <ProfilePage/>
                    }
                ]
            }
        ]
    }
]);