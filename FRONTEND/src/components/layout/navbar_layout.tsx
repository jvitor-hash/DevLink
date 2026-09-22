import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Menu, Settings } from "react-feather";

import Button from "@/components/ui/button_component";
import Drawer from "@/components/layout/drawer_layout";
import LoginModal from "@/components/layout/login_modal_layout";
import NotificationBell from "@/components/layout/notification_bell_layout";
import SavedTicketsMenu from "@/components/layout/saved_tickets_menu_layout";
import { authService } from "@/services/auth_service";
import type { UserDTO } from "@/lib/types/database";

const MENU_LINKS: ReadonlyArray<{ to: string; label: string }> = [
  { to: "/questionnaire", label: "Criação de projetos" },
  { to: "/project", label: "Projetos" },
  { to: "/profile", label: "Perfil" },
];

const HEADER_CLASS = "sticky top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center p-4";

export function NavbarLayout() : React.ReactElement {
  const [openLogin, setOpenLogin] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  // Track the latest user value for the interval callback without re-subscribing.
  const userRef = useRef<UserDTO | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refreshUser = useCallback(async () : Promise<void> => {
    const cachedUser = authService.getCachedUser();

    if (cachedUser) {
      setUser(cachedUser);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login/register write to the shared cache; subscribe to session changes via
  // storage events and a light poll instead of holding a second copy of auth state.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshUser();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshUser]);

  useEffect(() => {
    const poll = setInterval(() => {
      const cachedUser = authService.getCachedUser();

      if (cachedUser && cachedUser.id !== userRef.current?.id) {
        setUser(cachedUser);
        setIsLoading(false);
      }
    }, 1000);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== null) void refreshUser();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(poll);
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshUser]);

  const handleSignOut = async () : Promise<void> => {
    await authService.logout();
    setUser(null);
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <header className={HEADER_CLASS}>
        <div>
          <button className="hover:cursor-pointer" onClick={() => setOpenDrawer(true)}>
            <Menu size={18}/>
          </button>
        </div>

        <div>
          <Link to="/" className="text-xl">DevLink</Link>
        </div>

        <div className="justify-self-end">
          <Button label="Carregando..." buttonType="button" colorType="primary" disabled />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className={HEADER_CLASS}>
        <div>
          <button className="hover:cursor-pointer" onClick={() => setOpenDrawer(true)}>
            <Menu size={18}/>
          </button>
        </div>

        <div>
          <Link to="/" className="text-xl">DevLink</Link>
        </div>

        <div className="justify-self-end">
        {user ? (
          <div className="flex items-center gap-3">
            <NotificationBell />

            <SavedTicketsMenu />

            <Link to="/settings" className="flex items-center">
              <Settings size={18}/>
            </Link>

            <span className="text-white font-medium" data-testid="navbar-username">{user.name}</span>

            <Button label="Log-out" buttonType="button" colorType="primary" onClick={handleSignOut}/>
          </div>
        ) : (
          <Button
            label="Login"
            buttonType="button"
            colorType="primary"
            dataTestId='login-btn'
            onClick={() => setOpenLogin(true)}
          />
        )}
      </div>

      </header>

      <LoginModal show={openLogin} onClose={() => setOpenLogin(false)} />

      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        {MENU_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="text-xl w-full hover:text-(--primary) transition-colors">
            <ChevronRight className='inline'/>
            {link.label}
          </Link>
        ))}
      </Drawer>
    </>
  );
}
