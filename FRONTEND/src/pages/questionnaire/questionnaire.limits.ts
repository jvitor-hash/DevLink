import type { QuestionnaireForm } from "./questionnaire.types";

/** Every questionnaire text field uses this minimum length. */
export const QUESTIONNAIRE_TEXT_MIN = 30;

/** Every questionnaire text field uses this maximum length. */
export const QUESTIONNAIRE_TEXT_MAX = 256;

/** Project title min/max, shorter than the free text fields. */
export const QUESTIONNAIRE_TITLE_MIN = 10;
export const QUESTIONNAIRE_TITLE_MAX = 128;

/** Cap on budget digits accepted by the money inputs. */
export const QUESTIONNAIRE_BUDGET_MAX_DIGITS = 12;

type TextLengths = {
  problem: number;
  affectedUsers: number;
  northQuestion: number;
  hypothesis: number;
  audiencePainPoints: number;
  audienceAssumptions: number;
  notAudience: number;
  requirements: number;
  successCriteria: number;
  valueProposition: number;
  differentiation: number;
  title: number;
  description: number;
};

export type TextKey = keyof TextLengths;

/** Fields validated with the shared 30/256 text bounds. */
const textFields: readonly TextKey[] = [
  "problem",
  "affectedUsers",
  "northQuestion",
  "hypothesis",
  "audiencePainPoints",
  "audienceAssumptions",
  "notAudience",
  "requirements",
  "successCriteria",
  "valueProposition",
  "differentiation",
  "title",
  "description",
];

export const isTextField = (field: keyof QuestionnaireForm): field is TextKey =>
  textFields.includes(field as TextKey);

export const minLengthFor = (field: TextKey): number =>
  field === "title" ? QUESTIONNAIRE_TITLE_MIN : QUESTIONNAIRE_TEXT_MIN;

export const maxLengthFor = (field: TextKey): number =>
  field === "title" ? QUESTIONNAIRE_TITLE_MAX : QUESTIONNAIRE_TEXT_MAX;

export const isTextWithinLength = (field: TextKey, value: string): boolean =>
  value.length >= minLengthFor(field) && value.length <= maxLengthFor(field);
