export const BASE_URL =
  (typeof import.meta !== "undefined" && ((import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.API_URL)) ||
  (typeof process !== "undefined" && (process.env?.API_URL || process.env?.BASE_URL)) ||
  "http://localhost:3333";
