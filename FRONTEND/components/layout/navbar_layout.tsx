"use client";

import { useState } from 'react';
import { Menu } from 'react-feather';
import LoginModal from "./login_modal_layout";
import Button from '../ui/button_component';
import Link from 'next/link';
import Drawer from './drawer_layout';

export default function Navbar() {
  const [openLogin, setOpenLogin] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  return (
    <header className="flex justify-between p-4">
      <div>
        <button className="hover:cursor-pointer" onClick={() => setOpenDrawer(true)}>
          <Menu size={18}/>
        </button>
      </div>

      <div>
        <Link href="/" className="text-xl">DevLink</Link>
      </div>

      <div>
        <Button label="Login" buttonType="button" colorType="primary" onClick={() => setOpenLogin(true)}/>
      </div>

      <LoginModal show={openLogin} onClose={() => setOpenLogin(false)} />
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Link href="/" className="text-xl w-full hover:text-(--primary) transition-colors">Test</Link>
      </Drawer>
    </header>
  )
}
