import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, LogOut, Menu } from "react-feather";

import Button from "@/components/ui/button_component";
import Drawer from "@/components/ui/drawer_layout";
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
        <div className="backdrop-blur-sm grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2">
          <div>
            <button className="cursor-pointer" onClick={() => setOpenDrawer(true)}>
              <Menu size={18} />
            </button>
          </div>

          <div>
            <h2>
              <Link to="/" className="text-xl">DevLink</Link>
            </h2>
          </div>

          <div className="justify-self-end flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button className="group relative text-(--text-primary) cursor-pointer" data-testid="navbar-username">
                  <h6>{user.name}</h6>
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-300 group-hover:w-full" />
                </button>

                <button 
                  type="button" 
                  aria-label="Log-out" 
                  onClick={handleSignOut} 
                  className="p-1 cursor-pointer hover:bg-(--surface-3)/95 transition-colors"
                >
                  <LogOut size={16}/>
                </button>
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
        </div>
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
