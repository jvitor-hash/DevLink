import { AuthProvider } from "@/features/auth/components/auth_provider";
import NavbarLayout from "@/features/navbar/components/navbar_layout";

export default function UIRoot() {
    return (
        <>
            <AuthProvider>
                <NavbarLayout/>
            </AuthProvider>
        </>
    );
}