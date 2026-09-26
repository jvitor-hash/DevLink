import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Menu, Settings } from "react-feather";

import Button from "@/components/ui/button_component";
import Drawer from "@/components/ui/drawer_layout";
import LoginModal from "@/components/ui/login_modal";
import NotificationBell from "@/components/ui/notification_bell";
import SavedTicketsMenu from "@/components/ui/saved_tickets_menu";
import { userSingleton } from "@/context/user";

const MENU_LINKS: ReadonlyArray<{ to: string; label: string }> = [
  { to: "/questionnaire", label: "Criação de projetos" },
  { to: "/project", label: "Projetos" },
  { to: "/profile", label: "Perfil" },
];

export function NavbarLayout() : React.ReactElement {
  const [openLogin, setOpenLogin] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSignOut = async () : Promise<void> => {
    await userSingleton.logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center p-4">
        <div>
          <button className="hover:cursor-pointer" onClick={() => setOpenDrawer(true)}>
            <Menu size={18}/>
          </button>
        </div>

        <div>
          <Link to="/" className="text-xl">DevLink</Link>
        </div>

        <div className="justify-self-end">
        {userSingleton.isSignedIn ? (
          <div className="flex items-center gap-3">
            <NotificationBell />

            <SavedTicketsMenu />

            <Link to="/settings" className="flex items-center">
              <Settings size={18}/>
            </Link>

            <span className="text-white font-medium" data-testid="navbar-username">{userSingleton.name}</span>

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
