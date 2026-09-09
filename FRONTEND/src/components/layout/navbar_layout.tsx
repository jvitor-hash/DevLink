import { useEffect, useState } from 'react';
import { ChevronRight, Menu, User, Settings, LogOut } from 'react-feather';
import LoginModal from "./login_modal_layout";
import Button from '../ui/button_component';
import Drawer from './drawer_layout';
import { Link } from 'react-router-dom';
import { authService } from '@/services/auth_service';
import type { UserDTO } from '@/lib/types/database';

export default function Navbar() {
  const [openLogin, setOpenLogin] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = async () => {
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
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Watch for login/register events by checking cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const cachedUser = authService.getCachedUser();
      if (cachedUser && !user) {
        setUser(cachedUser);
        setIsLoading(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <header className="flex justify-between p-4">
        <div>
          <button className="hover:cursor-pointer" onClick={() => setOpenDrawer(true)}>
            <Menu size={18}/>
          </button>
        </div>
        <div>
          <Link to="/" className="text-xl">DevLink</Link>
        </div>
        <div>
          <Button label="Carregando..." buttonType="button" colorType="primary" disabled />
        </div>
      </header>
    );
  }

  return (
    <header className="flex justify-between p-4 items-center">
      <div>
        <button className="hover:cursor-pointer" onClick={() => setOpenDrawer(true)}>
          <Menu size={18}/>
        </button>
      </div>

      <div>
        <Link to="/" className="text-xl">DevLink</Link>
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/settings" className="flex items-center gap-2 text-white hover:text-(--primary) transition-colors">
              <Settings size={18}/>
            </Link>
            <span className="text-white font-medium">{user.name}</span>
            <Button label="Log-out" buttonType="button" colorType="primary" onClick={handleSignOut}/>
          </div>
        ) : (
          <Button
            label="Login"
            buttonType="button"
            colorType="primary"
            onClick={() => setOpenLogin(true)}
          />
        )}
      </div>

      <LoginModal show={openLogin} onClose={() => setOpenLogin(false)} />
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Link to="/questionnaire" className="text-xl w-full hover:text-(--primary) transition-colors"><ChevronRight className='inline'/>Questionário</Link>
        <Link to="/project" className="text-xl w-full hover:text-(--primary) transition-colors"><ChevronRight className='inline'/>Projetos</Link>
        <Link to="/profile" className="text-xl w-full hover:text-(--primary) transition-colors"><ChevronRight className='inline'/>Perfil</Link>
      </Drawer>
    </header>
  );
}
