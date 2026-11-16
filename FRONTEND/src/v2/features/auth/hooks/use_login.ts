import { useState } from "react";
import { useAuthContext } from "@/features/auth/components/auth_provider";

export default function useLogin({ data, mode }) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const { attemptLogin, attemptRegister } = useAuthContext();

  try {
    const result = null;
    if (!mode) { // login
      result = attemptLogin(data);
    } else { // register
      result = attemptRegister(data, mode ? "CLIENT" | "PROGRAMMER");
    }

    if (result.success) // Success & not null
      return result;

  } catch (error) {
    setError(error);
  } finally {
    setSubmitting(false);
  }

  return [submitting, error];
}