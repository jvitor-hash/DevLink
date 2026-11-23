import { useState, useCallback } from "react";
import { useAuthContext } from "@/features/auth/components/auth_provider";

export default function useLogin(options) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { attemptLogin, attemptRegister } = useAuthContext();

  const handleLogin = useCallback(async (data: { email: string; password: string }) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await attemptLogin(data);
      if (result.success) {
        options.onSuccess?.();
        return true;
      } else {
        setError(result.errors?.message || "Credenciais inválidas ou erro no servidor");
        return false;
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao realizar login");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [attemptLogin, options]);

  const handleRegister = useCallback(async (data: any, role: "CLIENT" | "PROGRAMMER") => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await attemptRegister(data, role);
      if (result.success) {
        options.onSuccess?.();
        return true;
      } else {
        setError(result.errors?.message || "Erro ao criar conta");
        return false;
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao cadastrar");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [attemptRegister, options]);

  return { submitting, error, setError, handleLogin, handleRegister };
}
