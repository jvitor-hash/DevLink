const VALUE_LABELS: Record<string, string> = {
  WEBSITES: "Websites", APP_DEVELOPMENT: "Desenvolvimento de apps", PLATFORM_MOBILE: "Plataforma Mobile", SUPORT_CYBERSECURITY: "Suporte e Cibersegurança", BLOCKCHAIN_WEB3: "Blockchain & Web3",
  CLIENTS: "Clientes", INTERNAL_TOOL: "Ferramenta interna", STUDENTS: "Estudantes", BUSINESSES: "Negócios", ADMINISTRATORS: "Administradores", RESEARCHER: "Pesquisadores",
  WEB: "Web", DESKTOP: "Desktop", MOBILE: "Mobile", CSHARP: "C#", NODE_JS: "Node.js", JAVA: "Java", GO: "Go", PYTHON: "Python", TYPESCRIPT: "TypeScript", JAVASCRIPT: "JavaScript", PHP: "PHP", RUST: "Rust", KOTLIN: "Kotlin", SWIFT: "Swift", OTHER: "Outro",
  OPEN: "Aberto", NEGOTIATING: "Em negociação", IN_DEVELOPMENT: "Em desenvolvimento", COMPLETED: "Concluído", CANCELLED: "Cancelado",
};

export const mapValueLabel = (value: string): string => VALUE_LABELS[value] ?? value;
