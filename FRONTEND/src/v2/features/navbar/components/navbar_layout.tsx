import { Link } from "react-router-dom";
import { ULIB } from "@/shared/ui";
import AuthModal from "@/features/auth/components/auth_modal";
import { useState } from "react";

export default function NavbarLayout() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-40 p-4 pb-6">
        <div className="backdrop-blur-sm flex items-center justify-between px-4 py-2">
          <div>
            <Link to="/"><img src="Logo.png" alt="Logo"></img></Link>
          </div>

          <div>
            <nav className="flex items-center gap-2">
              <Link to="/questionaire">Criacao de projetos</Link>
              <Link to="/project">Projetos</Link>
              <Link to="/contact">Contato</Link>
            </nav>

            <div>
              <ULIB.Button onClick={() => setModalOpen(true)}>Cadastre-se</ULIB.Button>
            </div>
          </div>
        </div>

        <AuthModal onClose={() => setModalOpen(!modalOpen)} />
      </header>
    </>
  );
}
