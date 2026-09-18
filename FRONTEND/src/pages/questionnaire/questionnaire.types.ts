import type {
  Audience,
  PlatformType,
  ProgrammingLanguage,
} from "@/lib/types/database";

export type QuestionnaireForm = {
  problem: string;
  affectedUsers: string;
  northQuestion: string;
  hypothesis: string;

  audience: Audience;
  audiencePainPoints: string;
  audienceAssumptions: string;
  notAudience: string;

  requirements: string;
  successCriteria: string;
  valueProposition: string;
  differentiation: string;

  platforms: PlatformType[];
  primaryLanguage: ProgrammingLanguage;

  category: string;
  subCategory: string;
  minBudget: string;
  maxBudget: string;
  deadline: string;

  title: string;
  description: string;
};

export type QuestionnaireFieldSetter = <
  K extends keyof QuestionnaireForm,
>(
  field: K,
  value: QuestionnaireForm[K],
) => void;

export type QuestionnaireStepProps = {
  form: QuestionnaireForm;
  setField: QuestionnaireFieldSetter;
  /** When true, unfilled required inputs of the current step render with the error style. */
  showFieldErrors?: boolean;
};

export type QuestionnairePlatformStepProps = QuestionnaireStepProps & {
  togglePlatform: (platform: PlatformType, checked: boolean) => void;
};

export type QuestionnaireDetailsStepProps = QuestionnaireStepProps & {
  isBudgetInverted: boolean;
};
