import { ApiRequestError } from "@/utils/api_client";
import { toastStore } from "@/utils/toast_store";

const DEFAULT_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

// Single sink for failed async work: logs for debugging and raises a toast so
// a failed request is never swallowed. Prefer the API's own message when the
// failure carries one, since apiClient already translates validation errors.
export const reportError = (context: string, error: unknown, fallbackMessage: string = DEFAULT_MESSAGE) : void => {
  console.error(`[${context}]`, error);

  const message = error instanceof ApiRequestError ? error.message : fallbackMessage;

  toastStore.error(message);
};
