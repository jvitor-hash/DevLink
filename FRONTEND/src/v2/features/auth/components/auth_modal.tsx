import { X } from "react-feather";
import { ULIB } from "@/shared/ui";

export interface AuthModalProps {
  submitting?: boolean;
  error?: string | null;
  mode?: boolean; // true = login, false = register
  onClose: () => void;
  onModeChange: (mode: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AuthModal({
  submitting = false,
  error = null,
  mode = true,
  onClose,
  onModeChange,
  onSubmit,
}: AuthModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md border border-(--border-subtle) bg-(--surface-1) p-6 rounded-lg text-(--text-primary) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="auth-modal-title" className="text-xl font-bold">
            {mode ? "Login" : "Cadastre-se"}
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-1 text-sm text-(--text-secondary)">
          {mode ? "Não possui uma conta?" : "Já possui uma conta?"}{" "}
          <button
            type="button"
            className="cursor-pointer text-(--primary) hover:underline font-medium"
            onClick={() => onModeChange(mode ? "register" : "login")}
          >
            {mode ? "Cadastre-se" : "Faça seu login"}
          </button>
        </p>

        {error && (
          <p role="alert" className="mt-3 p-2 text-xs bg-(--error)/10 border border-(--error)/30 text-(--error) rounded">
            {error}
          </p>
        )}

        <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
          <ULIB.field>
            <ULIB.label htmlFor="auth-email" required>E-mail</ULIB.label>
            <ULIB.input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nome@exemplo.com"
              required
            />
          </ULIB.field>

          <ULIB.field>
            <ULIB.label htmlFor="auth-password" required>Senha</ULIB.label>
            <ULIB.passwordInput
              id="auth-password"
              name="password"
              autoComplete={mode ? "current-password" : "new-password"}
              placeholder="Digite sua senha"
              required
            />
          </ULIB.field>

          {!mode && (
            <ULIB.field>
              <ULIB.label htmlFor="auth-name" required>Nome Completo</ULIB.label>
              <ULIB.input
                id="auth-name"
                name="name"
                type="text"
                placeholder="Digite seu nome completo"
                required
              />
            </ULIB.field>
          )}

          {!mode && (
            <ULIB.field>
              <ULIB.label htmlFor="auth-role" required>Tipo de Perfil</ULIB.label>
              <ULIB.select id="auth-role" name="role" defaultValue="CLIENT">
                <ULIB.selectOption value="CLIENT">Cliente (desejo criar projetos)</ULIB.selectOption>
                <ULIB.selectOption value="PROGRAMMER">Programador (desejo realizar projetos)</ULIB.selectOption>
              </ULIB.select>
            </ULIB.field>
          )}

          <div className="pt-2">
            <ULIB.button type="submit" disabled={submitting} className="w-full">
              {submitting ? (mode ? "Entrando..." : "Cadastrando...") : mode ? "Entrar" : "Criar Conta"}
            </ULIB.button>
          </div>
        </form>
      </div>
    </div>
  );
}
