import { redirect } from "react-router-dom";

export function redirectTo(path: string) {
  return redirect(path);
}