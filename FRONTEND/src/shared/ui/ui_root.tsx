import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/features/auth/components/auth_provider";
import NavbarLayout from "@/features/navbar/components/navbar_layout";
import { Toaster } from "./toaster";

export default function UIRoot() {
    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col bg-(--background) text-(--text-primary)">
                <NavbarLayout />
                <main>
                    <Outlet />
                </main>
                <Toaster />
            </div>
        </AuthProvider>
    );
}
