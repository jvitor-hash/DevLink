import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Menu, Settings } from "react-feather";

import Button from "@/components/ui/button_component";
import Drawer from "@/components/ui/drawer_layout";
import SavedTicketsMenu from "@/components/ui/saved_tickets_menu";
import NotificationBell from "@/components/ui/notification_bell";
import { GlassFrame } from "@/components/ui/glass_frame";
import { userSingleton } from "@/context/user";
import { useCurrentUser } from "@/hooks/use_current_user";

const MENU_LINKS: ReadonlyArray<{ to: string; label: string }> = [
  { to: "/questionnaire", label: "Criação de projetos" },
  { to: "/project", label: "Projetos" },
  { to: "/profile", label: "Perfil" },
];

type NavbarLayoutProps = { onOpenLogin: () => void };

export function NavbarLayout({ onOpenLogin } : NavbarLayoutProps) : React.ReactElement {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  // Re-renders on login, register and logout through the singleton subscription.
  const user = useCurrentUser();

  const navigate = useNavigate();

  const handleSignOut = async () : Promise<void> => {
    await userSingleton.logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 p-4 pb-6">
        <GlassFrame panelClassName="gb-navbar gb-tabbar grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2">
          <div>
            <button className="hover:cursor-pointer" onClick={() => setOpenDrawer(true)}>
              <Menu size={18}/>
            </button>
          </div>

          <div>
            <Link to="/" className="gb-heading text-xl">DevLink</Link>
          </div>

          <div className="justify-self-end">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />

                <SavedTicketsMenu />

                <Link to="/settings" className="flex items-center">
                  <Settings size={18}/>
                </Link>

                <span className="text-(--text-primary) font-medium" data-testid="navbar-username">{user.name}</span>

                <Button label="Log-out" buttonType="button" colorType="primary" onClick={handleSignOut}/>
              </div>
            ) : (
              <Button
                label="Login"
                buttonType="button"
                colorType="primary"
                dataTestId='login-btn'
                onClick={onOpenLogin}
              />
            )}
          </div>
        </GlassFrame>
      </header>

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
