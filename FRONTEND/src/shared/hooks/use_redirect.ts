import { useNavigate } from "react-router-dom";

export function useRedirect() {
  const navigate = useNavigate();

  return (url: string) => {
    navigate(url);
  };
}