import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/features/auth/components/auth_provider";
import NavbarLayout from "@/features/navbar/components/navbar_layout";
import { Toaster } from "./toaster";

export default function UIRoot() {
    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col bg-(--background) text-(--text-primary)">
                <NavbarLayout />
                <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
                    <Outlet />
                </main>
                <Toaster />
            </div>
        </AuthProvider>
    );
}
