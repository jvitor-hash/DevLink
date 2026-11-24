import { X } from "react-feather";
import { ULIB } from "@/shared/ui";
import { useState } from "react";
import useLogin from "../hooks/use_login";
import { createPortal } from "react-dom";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<boolean>(false);
  const { submitting, error, handleLogin, handleRegister } = useLogin({
    onSuccess: onClose,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (mode) {
      await handleLogin({ email, password });
    } else {
      const name = String(formData.get("name") || "").trim();
      const role = (formData.get("role") as "CLIENT" | "PROGRAMMER") || "CLIENT";
      await handleRegister({ name, email, password }, role);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="w-full max-w-md border border-(--border-subtle) bg-(--surface-1) p-6 text-(--text-primary) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="auth-modal-title" className="text-xl">{mode ? "Login" : "Cadastre-se"}</h2>
          <button  type="button"  aria-label="Fechar"
            className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 p-2 text-sm bg-(--error)/10 border border-(--error)/30 text-(--primary)">{error}</p>
        )}

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          {!mode && (
            <ULIB.field>
              <ULIB.label htmlFor="auth-name" required>Nome</ULIB.label>
              <ULIB.input id="auth-name" name="name" type="text" placeholder="Digite seu nome" required/>
            </ULIB.field>
          )}

          <ULIB.field>
            <ULIB.label htmlFor="auth-email" required>E-mail</ULIB.label>
            <ULIB.input id="auth-email" name="email" type="email" autoComplete="email" placeholder="nome@exemplo.com" required/>
          </ULIB.field>

          <ULIB.field>
            <ULIB.label htmlFor="auth-password" required>Senha</ULIB.label>
            <ULIB.passwordInput id="auth-password" name="password" autoComplete={mode ? "current-password" : "new-password"}
              placeholder="Digite sua senha"
              required
            />
          </ULIB.field>

          {!mode && (
            <div className="pt-2">
              <ULIB.field>
                <ULIB.label htmlFor="auth-role" required>Tipo de Perfil</ULIB.label>
                <ULIB.select id="auth-role" name="role" defaultValue="CLIENT">
                  <ULIB.selectOption value="CLIENT">Cliente</ULIB.selectOption>
                  <ULIB.selectOption value="PROGRAMMER">Programador</ULIB.selectOption>
                </ULIB.select>
              </ULIB.field>
            </div>
          )}

          <p className="mt-1 text-sm text-(--text-secondary)">
            {mode ? "Não possui uma conta?" : "Já possui uma conta?"}{" "}
            <button type="button" className="cursor-pointer text-(--primary) hover:underline" onClick={() => setMode((val) => !val)}>
              {mode ? "Cadastre-se" : "Faça seu login"}
            </button>
          </p>

          <div className="pt-2">
            <ULIB.button type="submit" disabled={submitting} className="w-full">
              {submitting ? mode ? "Entrando..." : "Cadastrando..." : mode ? "Entrar": "Criar Conta"}
            </ULIB.button>
          </div>
        </form>
      </div>
    </div>
  , document.body);
}
