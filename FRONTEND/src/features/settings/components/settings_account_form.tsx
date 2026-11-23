import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { authService } from "@/features/auth/service/auth_service";
import { toast } from "@/shared/utils/toast_store";

interface SettingsAccountFormProps {
  email: string;
}

export function SettingsAccountForm({ email }: SettingsAccountFormProps) {
  const [resetting, setResetting] = useState(false);

  const handlePasswordReset = async () => {
    setResetting(true);
    const result = await authService.resetPassword(email);
    setResetting(false);

    if (result.success) {
      toast.success("E-mail de redefinição de senha enviado!");
    } else {
      toast.error("Erro ao solicitar redefinição de senha.");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 border border-(--border) bg-(--surface-1) rounded-md max-w-xl">
      <div>
        <h3 className="text-base font-semibold text-(--text-primary)">Conta de Usuário</h3>
        <p className="text-xs text-(--text-secondary) mt-1">
          Gerencie o acesso e segurança da sua conta.
        </p>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="acc-email">E-mail Cadastrado</ULIB.label>
        <ULIB.input id="acc-email" value={email} disabled className="opacity-70 text-sm" />
      </ULIB.field>

      <div className="pt-2 border-t border-(--border-subtle) flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-(--text-primary)">Redefinir Senha</h4>
          <p className="text-xs text-(--text-muted)">
            Enviaremos um link de recuperação para o seu e-mail cadastrado.
          </p>
        </div>
        <ULIB.button tone="secondary" onClick={handlePasswordReset} disabled={resetting}>
          {resetting ? "Enviando..." : "Redefinir Senha"}
        </ULIB.button>
      </div>
    </div>
  );
}
