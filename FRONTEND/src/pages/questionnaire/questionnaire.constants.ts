import type {
  Audience,
  PlatformType,
  ProgrammingLanguage,
} from "@/lib/types/database";
import type { QuestionnaireForm } from "./questionnaire.types";

export const QUESTIONNAIRE_MAX_STEPS = 4;

export const initialQuestionnaireForm: QuestionnaireForm = {
  problem: "",
  affectedUsers: "",
  northQuestion: "",
  hypothesis: "",

  audience: "CLIENTS",
  audiencePainPoints: "",
  audienceAssumptions: "",
  notAudience: "",

  requirements: "",
  successCriteria: "",
  valueProposition: "",
  differentiation: "",

  platforms: [],
  primaryLanguage: "TYPESCRIPT",

  category: "",
  subCategory: "",
  minBudget: "",
  maxBudget: "",
  deadline: "",

  title: "",
  description: "",
};

export const audienceOptions: Record<string, Audience> = {
  "Clientes": "CLIENTS",
  "Ferramenta Interna": "INTERNAL_TOOL",
  "Negocios": "BUSINESSES",
  "Estudantes": "STUDENTS",
  "Administradores": "ADMINISTRATORS",
  "Pesquisadores": "RESEARCHER",
};

export const platformOptions: { label: string; value: PlatformType }[] = [
  { label: "Web", value: "WEB" },
  { label: "Desktop", value: "DESKTOP" },
  { label: "Mobile", value: "MOBILE" },
];

export const primaryLanguageOptions: Record<string, ProgrammingLanguage> = {
  "C#": "CSHARP",
  "Node.js": "NODE_JS",
  "Rust": "RUST",
  "Kotlin": "KOTLIN",
  "Java": "JAVA",
  "Php": "PHP",
  "Go": "GO",
  "Python": "PYTHON",
  "TypeScript": "TYPESCRIPT",
  "Swift": "SWIFT",
};

export const categoryOptions: Record<string, string> = {
  "test": "test",
};

/** Allowed enum values, derived from the option tables above, used to
 * sanitize a restored draft before it reaches the form state. */
export const platformValues: readonly PlatformType[] = platformOptions.map(({ value }) => value);
export const audienceValues: readonly Audience[] = Object.values(audienceOptions);
export const primaryLanguageValues: readonly ProgrammingLanguage[] = Object.values(primaryLanguageOptions);
