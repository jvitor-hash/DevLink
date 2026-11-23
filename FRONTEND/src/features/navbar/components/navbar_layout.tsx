import { Link } from "react-router-dom";
import { ULIB } from "@/shared/ui";
import AuthModal from "@/features/auth/components/auth_modal";
import { useState } from "react";
import { useCurrentUser } from "@/features/auth/hooks/use_current_user";
import { useAuthContext } from "@/features/auth/components/auth_provider";
import { NotificationBell } from "@/features/notifications/components/notification_bell";
import { LogOut, User } from "react-feather";

export default function NavbarLayout() {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const currentUser = useCurrentUser();
  const { signOut } = useAuthContext();

  return (
    <>
      <header className="sticky top-0 z-40 p-4 pb-2 bg-(--background)/80 backdrop-blur-md border-b border-(--border-subtle)">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-xl tracking-tight text-(--text-primary)">
              <img src="/favicon.ico" alt="DevLink" className="w-6 h-6 inline-block mr-2" />
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
                <NotificationBell />

                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-(--text-primary) hover:text-(--primary) transition-colors"
                >
                  <User size={16} />
                  <span>{currentUser.name}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-1.5 text-(--text-muted) hover:text-(--error) cursor-pointer transition-colors"
                  title="Sair da conta"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ULIB.button onClick={() => setModalOpen(true)}>Entrar / Cadastre-se</ULIB.button>
              </div>
            )}
          </div>
        </div>

        {isModalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
      </header>
    </>
  );
}
