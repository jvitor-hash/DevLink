import { X } from "react-feather";
import { ULIB } from "@/shared/ui";

export default function AuthModal({ submitting, error, mode, onClose, onModeChange, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-md border border-(--border-subtle) bg-(--surface-1) p-6 text-(--text-primary)">
        <div className="flex items-center justify-between">
          <h2 id="auth-modal-title" className="text-2xl">{mode ? "Login" : "Cadastre-se"}</h2>
          <button type="button" aria-label="Fechar" className="cursor-pointer" onClick={onClose}>
            <X />
          </button>
        </div>

        <p className="mt-2">
          {mode ? "Não possui uma conta?" : "Já possui uma conta?"}{" "}
          <button type="button" className="cursor-pointer text-(--info)" onClick={() => onModeChange(mode ? "register" : "login")}>
            {mode ? "Cadastre-se" : "Faça seu login"}
          </button>
        </p>

        {error && <p role="alert" className="mt-3 text-(--error)">{error}</p>}

        <form className="mt-5 flex flex-col gap-3" onSubmit={onSubmit}>
          <ULIB.field>
            <ULIB.label htmlFor="auth-email" required>E-mail</ULIB.label>
            <ULIB.input id="auth-email" name="email" type="email" autoComplete="email" placeholder="Nome@Exemplo.com" />
          </ULIB.field>

          <ULIB.field>
            <ULIB.label htmlFor="auth-password" required>Senha</ULIB.label>
            <ULIB.passwordInput
              id="auth-password"
              name="password"
              autoComplete={mode ? "current-password" : "new-password"}
              placeholder="Digite sua senha"
            />
          </ULIB.field>

          {!mode && (
            <ULIB.field>
              <ULIB.label htmlFor="auth-name" required>Nome</ULIB.label>
              <ULIB.input id="auth-name" name="name" type="text" placeholder="Digite seu nome" />
            </ULIB.field>
          )}

          {!mode && (
            <ULIB.field>
              <ULIB.label htmlFor="auth-role" required>Tipo de usuário</ULIB.label>
              <ULIB.select id="auth-role" name="role" defaultValue="">
                <option value="" disabled>Selecione uma opção</option>
                <ULIB.selectOption value="CLIENT">Cliente</ULIB.selectOption>
                <ULIB.selectOption value="PROGRAMMER">Programador</ULIB.selectOption>
              </ULIB.select>
            </ULIB.field>
          )}

          <ULIB.button type="submit" disabled={submitting}>
            {submitting ? (mode ? "Entrando..." : "Cadastrando...") : mode ? "Login" : "Cadastre-se"}
          </ULIB.button>
        </form>
      </div>
    </div>
  );
}
