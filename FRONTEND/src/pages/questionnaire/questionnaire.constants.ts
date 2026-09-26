import type {
  Audience,
  PlatformType,
  ProgrammingLanguage,
} from "@/data/types/database";
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
  "Websites":                 "WEBSITES",
  "Desenvolvimento de apps":  "APP_DEVELOPMENT",
  "Plataforma Mobile":        "PLATFORM_MOBILE",
  "Suporte e Cibersegurança": "SUPORT_CYBERSECURITY",
  "Blockchain & Web3":        "BLOCKCHAIN_WEB3"
};

export const subCategoryOptions: ReadonlyArray<{category: string, subCategories: Record<string, string> }> = [
  { category: "WEBSITES", subCategories: {
    "Wordpress":                 "WORDPRESS",
    "Shopify":                   "SHOPIFY",
    "Sites personalizados":      "PERSONALIZED_WEBSITES",
    "Wix & Webflow":             "WIX_WEBFLOW",
    "Squarespace & WooCommerce": "SQUARESPACE_WOOCOMMERCE"
  } },
  
  { category: "APP_DEVELOPMENT", subCategories: {
    "Aplicação Full-Stack":      "FULL_STACK_APPLICATION",
    "Aplicação Desktop & Jogos": "DESKTOP_GAMES_APLICATION",
    "Extensão de navegador":     "BROWSER_EXTENSION",
    "Desenvolvimento de APIs":   "APIS_DEVELOPMENT",
    "Chatbots AI":               "CHATBOTS_AI"
  } },

  { category: "PLATFORM_MOBILE", subCategories: {
    "Desenvolvimento Mobile":      "DEVELOPMENT_MOBILE",
    "Aplicativos Multiplataforma": "MULTIPLATFORM_APLICATIONS",
    "Aplicativos Android":         "ANDROID_APLICATIONS",
    "Aplicativos iOS":             "IOS_APLICATIONS"
  } },

  { category: "SUPORT_CYBERSECURITY", subCategories: {
    "Cloud Computing & DevOps": "CLOUD_COMPUTING_DEVOPS",
    "Cibersegurança":           "CYBERSECURITY",
    "Suporte e TI":             "SUPORT_IT",
    "Manutenção de Sistemas":   "SYSTEMS_MAINTENANCE"
  } },
  
  { category: "BLOCKCHAIN_WEB3", subCategories: {
    "Desenvolvimento Blockchains": "DEVELOPMENT_BLOCKCHAINS",
    "Apps Descentralizados":       "DECENTRALIZED_APPS",
    "Criptomoedas e Tokens":       "CYPTOCURRENCY_TOKENS"
  } }
]

/** Allowed enum values, derived from the option tables above, used to
 * sanitize a restored draft before it reaches the form state. */
export const platformValues: readonly PlatformType[] = platformOptions.map(({ value }) => value);
export const audienceValues: readonly Audience[] = Object.values(audienceOptions);
export const primaryLanguageValues: readonly ProgrammingLanguage[] = Object.values(primaryLanguageOptions);
