import { useState, useCallback } from "react";
import { sessionCache } from "@/shared/utils/session_cache";
import { questionaireService } from "../service/questionaire_service";
import { toast } from "@/shared/utils/toast_store";
import { useRedirect } from "@/shared/hooks/use_redirect";

export interface QuestionaireFormData {
  // Step 1: Problem
  category: string;
  sub_category: string;
  problem: string;
  user_actions: string;
  affectedUsers: string;

  // Step 2: Solution
  title: string;
  description: string;
  northQuestion: string;
  hypothesis: string;
  valueProposition: string;

  // Step 3: Audience
  audience: any;
  audiencePainPoints: string;
  audienceAssumptions: string;
  notAudience: string;

  // Step 4: Execution
  platforms: any[];
  primaryLanguage: any;
  minBudget: number;
  maxBudget: number;
  deadline: string;
  requirements: string;
  successCriteria: string;
}

const INITIAL_FORM: QuestionaireFormData = {
  category: "WEBSITES",
  sub_category: "PERSONALIZED_WEBSITES",
  problem: "",
  user_actions: "",
  affectedUsers: "",
  title: "",
  description: "",
  northQuestion: "",
  hypothesis: "",
  valueProposition: "",
  audience: "CLIENTS",
  audiencePainPoints: "",
  audienceAssumptions: "",
  notAudience: "",
  platforms: ["WEB"],
  primaryLanguage: "TYPESCRIPT",
  minBudget: 1000,
  maxBudget: 5000,
  deadline: "",
  requirements: "",
  successCriteria: "",
};

const DRAFT_KEY = "questionaire_draft";

export function useQuestionaireForm() {
  const redirect = useRedirect();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<QuestionaireFormData>(() => {
    const saved = sessionCache.read<QuestionaireFormData>(DRAFT_KEY);
    return saved ? { ...INITIAL_FORM, ...saved } : INITIAL_FORM;
  });
  const [submitting, setSubmitting] = useState(false);

  const updateFields = useCallback((patch: Partial<QuestionaireFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch };
      sessionCache.write(DRAFT_KEY, next);
      return next;
    });
  }, []);

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.category || !formData.sub_category) {
        toast.error("Por favor, selecione a categoria e sub-categoria.");
        return false;
      }
      if (!formData.problem.trim()) {
        toast.error("Por favor, descreva o problema que seu projeto pretende resolver.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error("Por favor, preencha o título e a descrição do projeto.");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.audience) {
        toast.error("Por favor, selecione o público-alvo.");
        return false;
      }
    }
    if (currentStep === 4) {
      if (formData.platforms.length === 0) {
        toast.error("Selecione pelo menos uma plataforma.");
        return false;
      }
      if (formData.minBudget <= 0 || formData.maxBudget < formData.minBudget) {
        toast.error("Verifique os valores de orçamento mínimo e máximo.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const submitProject = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);

    const cleanField = (val: string | undefined | null) => (val && val.trim() ? val.trim() : null);

    const payload = {
      category: formData.category,
      sub_category: formData.sub_category,
      title: formData.title.trim(),
      description: formData.description.trim(),
      problem: cleanField(formData.problem),
      user_actions: cleanField(formData.user_actions),
      affectedUsers: cleanField(formData.affectedUsers),
      northQuestion: cleanField(formData.northQuestion),
      hypothesis: cleanField(formData.hypothesis),
      valueProposition: cleanField(formData.valueProposition),
      audience: formData.audience,
      audiencePainPoints: cleanField(formData.audiencePainPoints),
      audienceAssumptions: cleanField(formData.audienceAssumptions),
      notAudience: cleanField(formData.notAudience),
      platforms: formData.platforms,
      primaryLanguage: formData.primaryLanguage,
      minBudget: Number(formData.minBudget),
      maxBudget: Number(formData.maxBudget),
      deadline: cleanField(formData.deadline),
      requirements: cleanField(formData.requirements),
      successCriteria: cleanField(formData.successCriteria),
      status: "OPEN",
    };

    const result = await questionaireService.submitProject(payload);
    setSubmitting(false);

    if (result.success && result.data) {
      sessionCache.delete(DRAFT_KEY);
      toast.success("Projeto publicado com sucesso!");
      redirect(`/project/open/${result.data.id}`);
    } else {
      toast.error(result.errors?.message || "Erro ao publicar projeto.");
    }
  };

  return { step, setStep, formData, updateFields, nextStep, prevStep, submitProject, submitting };
}
