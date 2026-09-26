import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { X } from "react-feather";
import Button from "./button_component";
import Input from "../form/input_component";
import Checkbox from "../form/checkbox_component";
import { SegmentedButton } from "@/components/form/segmented_button_component";
import type { RegisterRole } from "@/data/services/auth_service";
import { userSingleton } from "@/context/user";

type LoginModalProps = { show: boolean; onClose: () => void };

export default function LoginModal({ show, onClose }: LoginModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (show && !dialog.open) dialog.showModal();
    if (!show && dialog.open) dialog.close();
  }, [show]);

  const close = () => {
    dialogRef.current?.close();
    setMode("login");
    setError(null);
    onClose();
  };

  const changeMode = (nextMode: "login" | "register") => {
    setError(null);
    setMode(nextMode);
  };

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const role = formData.get("role");

    try {
      if (typeof email !== "string" || typeof password !== "string") {
        throw new Error("Preencha seu e-mail e sua senha.");
      }

      if (mode === "login") {
        userSingleton.login({ email, password });
      } else {
        const name = formData.get("name");
        if (typeof name !== "string" || !name.trim()) {
          throw new Error("Preencha seu nome.");
        }
        if (role !== "CLIENT" && role !== "PROGRAMMER") {
          throw new Error("Selecione o tipo de usuário.");
        }
        userSingleton.register({ name, email, password, registrationRole: role as RegisterRole });
      }

      close();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível concluir a operação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div onClick={close} className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity ${show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <dialog ref={dialogRef} onCancel={close} className="animated-dialog bg-(--surface-1) m-auto text-white rounded-md p-6 border border-(--border-subtle)">
        {mode === "login" ? (
          <>
            <div className="flex justify-between"><p className="text-2xl">Login</p><button type="button" onClick={close} aria-label="Fechar"><X /></button></div>
            <p className="mt-2">Não possui uma conta? <button type="button" className="text-(--info) hover:cursor-pointer" data-testid="register-link" onClick={() => changeMode("register")}>Cadastre-se</button></p>
            {error && <p role="alert" className="mt-3 text-(--error)">{error}</p>}
            <form className="mt-5 flex flex-col gap-3" onSubmit={submit}>
              <Input icon="mail" dataTestId="email-input" inputType="email" name="email" autocomplete="email" placeholder="Nome@Exemplo.com" label="E-mail" />
              <Input icon="lock" dataTestId="password-input" inputType="password" name="password" autocomplete="password" placeholder="Digite sua senha" label="Senha" />
              <label className="flex items-center"><Checkbox label="Salvar essa sessão?" checked /></label>
              <div className="flex justify-center gap-5 mt-2">
                <Button buttonType="submit" dataTestId="submit-btn" colorType="success" label={submitting ? "Entrando..." : "Login"} />
                <Button buttonType="reset" dataTestId="reset-btn" colorType="secondary" label="Limpar" />
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-between"><p className="text-2xl">Cadastre-se</p><button type="button" onClick={close} aria-label="Fechar"><X /></button></div>
            <p className="mt-2">Já possui uma conta? <button type="button" className="text-(--info) hover:cursor-pointer" onClick={() => changeMode("login")}>Faça seu login</button></p>
            {error && <p role="alert" className="mt-3 text-(--error)">{error}</p>}
            <form className="mt-5 flex flex-col gap-3" onSubmit={submit}>
              <Input inputType="text" dataTestId="name-input" name="name" placeholder="Digite seu nome" label="Nome" />
              <Input icon="mail" dataTestId="email-input" inputType="email" name="email" autocomplete="email" placeholder="Nome@Exemplo.com" label="E-mail" />
              <Input icon="lock" dataTestId="password-input" inputType="password" name="password" autocomplete="password" placeholder="Digite sua senha" label="Senha" />
              <SegmentedButton
                title="Tipo de usuário"
                name="role"
                items={{
                  CLIENT: "Cliente",
                  PROGRAMMER: "Programador",
                }}
              />
              <div className="flex justify-center gap-5 mt-2">
                <Button buttonType="submit" dataTestId="submit-btn" colorType="success" label={submitting ? "Cadastrando..." : "Cadastre-se"} />
                <Button buttonType="reset" dataTestId="reset-btn" colorType="secondary" label="Limpar" />
              </div>
            </form>
          </>
        )}
      </dialog>
    </>
  );
}
