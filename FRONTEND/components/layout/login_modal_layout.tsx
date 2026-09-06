"use client";

import { useState, useRef, useEffect } from "react";
import Button from "../ui/button_component";
import { X } from "react-feather";
import Input from "../ui/input_component";
import Checkbox from "../ui/checkbox_component";
import { SegmentedButton } from "../ui/segmented_button_component";

type LoginModalProps = {
  show: boolean;
  onClose: () => void;
};

export default function LoginModal({ show, onClose }: LoginModalProps) {
  const [method, setMethod] = useState<number>(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (show && !dialog.open) {
      dialog.showModal();
    }

    if (!show && dialog.open) {
      dialog.close();
    }
  }, [show]);

  const handleClose = () => {
    dialogRef.current?.close();
    setMethod(0);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity
          ${show ?
            "pointer-events-auto opacity-100" :
            "pointer-events-none opacity-0"}`}
      />

      <dialog ref={dialogRef} onCancel={handleClose} className="animated-dialog m-auto text-white rounded-md p-6 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
        {method === 0 && (
          <div>
            <div className="w-full flex justify-between">
            <p className="text-2xl">Login</p>
              <button onClick={handleClose} className="hover:cursor-pointer">
                <X/>
              </button>
            </div>
            <p className="mt-2">Não possui uma conta? <button className="text-(--info) hover:cursor-pointer inline" onClick={() => setMethod(1)}>Cadastre-se</button></p>

            <form className="mt-5">
              <div>
                <Input inputType="email" placeholder="Nome@Exemplo.com" label="E-mail"/>
              </div>

              <div className="mt-3">
                <Input inputType="password" placeholder="Digite sua senha" label="Senha"/>
              </div>

              <div className="mt-3">
                <Checkbox label="Salvar essa sessão?" checked={true} />
              </div>

              <div className="w-full flex justify-center items-center gap-5 mt-5">
                <Button buttonType="button" colorType="success" label="Login" onClick={() => setMethod(1)} />
                <Button buttonType="reset" colorType="secondary" label="Limpar" />
              </div>
            </form>
          </div>
        )}

        {method === 1 && (
          <div>
            <div className="w-full flex justify-between">
              <p className="text-2xl">Cadastre-se</p>
              <button onClick={handleClose} className="hover:cursor-pointer">
                <X/>
              </button>
            </div>
            <p className="mt-2">Já possui uma conta? <button className="text-(--info) hover:cursor-pointer inline" onClick={() => setMethod(0)}>Faça seu login</button></p>

            <form className="mt-5">
              <div>
                <Input inputType="text" placeholder="Digite seu nome" label="Nome"/>
              </div>

              <div className="mt-3">
                <Input inputType="email" placeholder="Nome@Exemplo.com" label="E-mail"/>
              </div>

              <div className="mt-3">
                <Input inputType="password" placeholder="Digite sua senha" label="Senha" />
              </div>

              <div className="mt-3">
                <SegmentedButton
                  title="Tipo de usuario"
                  items={{
                    client: "Cliente",
                    programmer: "Programador",
                  }}
                  defaultValue="client"
                />
              </div>

              <div className="w-full flex justify-center items-center gap-5 mt-5">
                <Button colorType="success" buttonType="submit" label="Cadastre-se" />
                <Button colorType="secondary" label="Limpar" buttonType="reset" />
              </div>
            </form>
          </div>
        )}
      </dialog>
    </>
  );
}
