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
const ProjectPage = lazy(() => import("@/pages/project"));
const ProjectOpenPage = lazy(() => import("@/pages/project_open"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const NotificationPage = lazy(() => import("@/pages/notification"));
const QuestionnairePage = lazy(() => import("@/pages/questionnaire"));
const ContactPage = lazy(() => import("@/pages/contact"));

export const router = createBrowserRouter([
    {
        "path": "/",
        element: <UIRoot/>,
        errorElement: <ErrorPage/>,
        children=[
            { index: true, element: <HomePage/> },
            { path: "contact", element: <ContactPage/>}

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