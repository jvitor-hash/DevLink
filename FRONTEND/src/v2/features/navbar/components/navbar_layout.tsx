import { Link } from "react-router-dom";
import { ULIB } from "@/shared/ui";
import AuthModal from "@/features/auth/components/auth_modal";
import { useState } from "react";
import { useCurrentUser } from "@/features/auth/hooks/use_current_user";
import { useAuthContext } from "@/features/auth/components/auth_provider";
import { useLogin } from "@/features/auth";
import { NotificationBell } from "@/features/notifications/components/notification_bell";
import { SavedTicketsMenu } from "@/features/project/components/saved_tickets_menu";
import { LogOut, User } from "react-feather";

export default function NavbarLayout() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const currentUser = useCurrentUser();
  const { signOut } = useAuthContext();

  const { submitting, error, handleLogin, handleRegister } = useLogin({
    onSuccess: () => setModalOpen(false),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const role = (formData.get("role") as "CLIENT" | "PROGRAMMER") || "CLIENT";

    if (isLoginMode) {
      handleLogin({ email, password });
    } else {
      handleRegister({ email, password, name }, role);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 p-4 pb-2 bg-(--background)/80 backdrop-blur-md border-b border-(--border-subtle)">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-xl tracking-tight text-(--text-primary)">
              DevLink
            </Link>

            <nav className="flex items-center gap-4 text-sm font-medium text-(--text-secondary)">
              <Link to="/project" className="hover:text-(--text-primary) transition-colors">
                Projetos
              </Link>
              <Link to="/questionaire" className="hover:text-(--text-primary) transition-colors">
                Criar Projeto
              </Link>
              <Link to="/contact" className="hover:text-(--text-primary) transition-colors">
                Contato
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <SavedTicketsMenu />
                <NotificationBell />

                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-(--border) hover:bg-(--surface-2) transition-colors"
                >
                  <User size={14} />
                  <span>{currentUser.name}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-1.5 text-(--text-muted) hover:text-(--error) cursor-pointer"
                  title="Sair da conta"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ULIB.button
                  tone="secondary"
                  onClick={() => {
                    setIsLoginMode(true);
                    setModalOpen(true);
                  }}
                >
                  Entrar
                </ULIB.button>
                <ULIB.button
                  onClick={() => {
                    setIsLoginMode(false);
                    setModalOpen(true);
                  }}
                >
                  Cadastre-se
                </ULIB.button>
              </div>
            )}
          </div>
        </div>

        {modalOpen && (
          <AuthModal
            mode={isLoginMode}
            submitting={submitting}
            error={error}
            onClose={() => setModalOpen(false)}
            onModeChange={(newMode: string) => setIsLoginMode(newMode === "login")}
            onSubmit={handleSubmit}
          />
        )}
      </header>
    </>
  );
}
