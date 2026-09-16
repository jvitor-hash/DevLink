import Button from "@/components/ui/button_component";
import Checkbox from "@/components/ui/checkbox_component";
import Input from "@/components/ui/input_component";
import MoneyInput from "@/components/ui/money_input_component";
import SegmentedProgressBar from "@/components/ui/segmented_progress_bar_component";
import Select from "@/components/ui/select_component";
import TextArea from "@/components/ui/textarea_component";
import { projectService } from "@/services/project_service";
import type { PlatformType, ProgrammingLanguage, Audience, ProjectCreate } from "@/lib/types/database";
import { authService } from "@/services/auth_service";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type QuestionnaireForm = {
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

const initialForm: QuestionnaireForm = {
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

export default function Questionnaire() {
  const [steps, setStep] = useState<number>(1);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [form, setForm] = useState<QuestionnaireForm>(initialForm);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const maxSteps = 4;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const checkPermission = async (): Promise<void> => {
      try {
        const hasPermission = await authService.hasPermission({ projects: ["create"] });
        if (cancelled) return;

        if (hasPermission) {
          setAllowed(true);
          return;
        }

        navigate("/", { state: { from: location } });
      } catch {
        if (!cancelled) navigate("/", { state: { from: location } });
      }
    };

    checkPermission();

    return () => {
      cancelled = true;
    };
  });

  const setField = <K extends keyof QuestionnaireForm>(key: K, value: QuestionnaireForm[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlatform = (platform: PlatformType, checked: boolean): void => {
    setForm((prev) => ({
      ...prev,
      platforms: checked ? [...prev.platforms, platform] : prev.platforms.filter((p) => p !== platform),
    }));
  };

  const handleBackStep = (): void => {
    if (steps > 1)
      setStep(steps - 1);
  };

  const handleNextStep = (): void => {
    if (steps < maxSteps)
      setStep(steps + 1);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!form.platforms.length || !form.title.trim() || !form.description.trim() || !form.category.trim() || !form.subCategory.trim()) {
      setError("Preencha titulo, descricao, categoria, sub-categoria e selecione ao menos uma plataforma.");
      return;
    }

    if (form.minBudget !== "" && form.maxBudget !== "" && Number(form.maxBudget) < Number(form.minBudget)) {
      setError("O orcamento maximo nao pode ser menor que o minimo.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: ProjectCreate = {
        title: form.title,
        description: form.description,
        category: form.category,
        sub_category: form.subCategory,
        primaryLanguage: form.primaryLanguage,
        platforms: form.platforms,
        audience: form.audience,
        minBudget: form.minBudget === "" ? 1 : Number(form.minBudget),
        maxBudget: form.maxBudget === "" ? form.minBudget === "" ? 1 : Number(form.minBudget) : Number(form.maxBudget),
        deadline: form.deadline === "" ? null : new Date(form.deadline).toISOString(),
        problem: form.problem || null,
        affectedUsers: form.affectedUsers || null,
        northQuestion: form.northQuestion || null,
        hypothesis: form.hypothesis || null,
        audiencePainPoints: form.audiencePainPoints || null,
        audienceAssumptions: form.audienceAssumptions || null,
        notAudience: form.notAudience || null,
        requirements: form.requirements || null,
        successCriteria: form.successCriteria || null,
        valueProposition: form.valueProposition || null,
        differentiation: form.differentiation || null,
      };

      await projectService.create(payload);
      setForm(initialForm);
      setStep(1);
      navigate("/project");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível publicar o projeto.");
    } finally {
      setSubmitting(false);
    }
  };

  if (allowed === null) return null;

  return (
    <>
      <section>

      </section>

      <section>
        <div className="mx-4 mt-2 min-w-auto bg-(--surface-1) p-4 rounded-sm border border-(--border)">
          <div className="mt-4">
            <h2 className="text-2xl w-full text-center">Criação de projetos</h2>
            <p className="text-base text-(--text-muted) text-center">
              Descreva suas ideas aqui e publique para possiveis programadores
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <SegmentedProgressBar progress={steps} maxValue={maxSteps} segments={maxSteps} />
          </div>

          {/* Page - 1 */}
          {steps === 1 && (
            <div>
              <div className="flex flex-col gap-4 ">
                <TextArea label="Qual é o problema a ser resolvido?" name="problem" value={form.problem} onChange={(e) => setField("problem", e.target.value)} placeholder="Digite suas ideas sobre a resolusão de seu projeto..." />
                <TextArea label="Quem é mais afetado por esse problema?" name="affected" value={form.affectedUsers} onChange={(e) => setField("affectedUsers", e.target.value)} placeholder="Escreva sobre quem é mais afetado com esse problema..." />
                <TextArea label="Qual é a questão norte do projeto?" name="northQuestion" value={form.northQuestion} onChange={(e) => setField("northQuestion", e.target.value)} placeholder="Ex: " />
                <TextArea label="Qual seriá a sua hipótese sobre o problema?" name="hypothesis" value={form.hypothesis} onChange={(e) => setField("hypothesis", e.target.value)} placeholder="Escreva sobre affirmações testáveis do problema" />
              </div>
            </div>
          )}

          {/* Page - 2 */}
          {steps === 2 && (
            <div>
              <div>
                <p>Quem são os principais usuários?</p>
                <Select labels={{
                  "Clientes": "CLIENTS",
                  "Ferramenta Interna": "INTERNAL_TOOL",
                  "Negocios": "BUSINESSES",
                  "Estudantes": "STUDENTS",
                  "Administradores": "ADMINISTRATORS",
                  "Pesquisadores": "RESEARCHER"
                }} name="audience" defaultValue={form.audience} onChange={(e) => setField("audience", e.currentTarget.value as Audience)} />
              </div>

              <TextArea label="Quais são os objetivos e os pontos de dor deles?" name="audiencePainPoints" value={form.audiencePainPoints} onChange={(e) => setField("audiencePainPoints", e.target.value)} />
              <TextArea label="Que suposições estamos fazendo sobre eles?" name="audienceAssumptions" value={form.audienceAssumptions} onChange={(e) => setField("audienceAssumptions", e.target.value)} />
              <TextArea label="Quem não é o usuário-alvo?" name="notAudience" value={form.notAudience} onChange={(e) => setField("notAudience", e.target.value)} />
            </div>
          )}

          {/* Page - 3 */}
          {steps === 3 && (
            <div>
              <TextArea label="O que o produto deve realizar?" name="requirements" value={form.requirements} onChange={(e) => setField("requirements", e.target.value)} />
              <TextArea label="Como é o sucesso?" name="successCriteria" value={form.successCriteria} onChange={(e) => setField("successCriteria", e.target.value)} />
              <TextArea label="Qual é a proposta de valor central do produto?" name="valueProposition" value={form.valueProposition} onChange={(e) => setField("valueProposition", e.target.value)} />
              <TextArea label="O que o diferencia das alternativas?" name="differentiation" value={form.differentiation} onChange={(e) => setField("differentiation", e.target.value)} />
              <div className="mt-2">
                <p className="mb-2">Plataformas:</p>
                <div className="flex gap-4">
                  <Checkbox label="Web" checked={form.platforms.includes("WEB")} onToggle={(checked) => handlePlatform("WEB", checked)} />
                  <Checkbox label="Desktop" checked={form.platforms.includes("DESKTOP")} onToggle={(checked) => handlePlatform("DESKTOP", checked)} />
                  <Checkbox label="Mobile" checked={form.platforms.includes("MOBILE")} onToggle={(checked) => handlePlatform("MOBILE", checked)} />
                </div>
              </div>

              <div>
                <p>Qual seria a linguagem de programacao principal?</p>
                <Select labels={{
                  "C#": "CSHARP",
                  "Node.js": "NODE_JS",
                  "Rust": "RUST",
                  "Kotlin": "KOTLIN",
                  "Java": "JAVA",
                  "Php": "PHP",
                  "Go": "GO",
                  "Python": "PYTHON",
                  "TypeScript": "TYPESCRIPT",
                  "Swift": "SWIFT"
                }} name="primaryLanguage" defaultValue={form.primaryLanguage} onChange={(e) => setField("primaryLanguage", e.currentTarget.value as ProgrammingLanguage)} />
              </div>
            </div>
          )}

          {/* Page - 4 */}
          {steps === 4 && (
            <div>
              <Input label="Qual seria o titulo desse projeto?" name="title" value={form.title} onChange={(e) => setField("title", e.target.value)} />
              <TextArea label="Descreva seu projeto em poucas palavras?" name="description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
              <Input label="Qual a categoria do projeto?" name="category" value={form.category} onChange={(e) => setField("category", e.target.value)} />
              <Input label="Qual a sub-categoria do projeto?" name="subCategory" value={form.subCategory} onChange={(e) => setField("subCategory", e.target.value)} />
              <div className="flex gap-4">
                <MoneyInput label="Orçamento minimo (R$)" name="minBudget" value={form.minBudget} dataTestId="minBudget" onChange={(value) => setField("minBudget", value)} />
                <MoneyInput label="Orçamento maximo (R$)" name="maxBudget" value={form.maxBudget} dataTestId="maxBudget" onChange={(value) => setField("maxBudget", value)} />
              </div>

              <div className="mt-4">
                <Input label="Prazo final do projeto" name="deadline" inputType="date" value={form.deadline} onChange={(e) => setField("deadline", e.target.value)} />
              </div>

              {form.minBudget !== "" && form.maxBudget !== "" && Number(form.maxBudget) < Number(form.minBudget) && (
                <p className="mt-3 text-(--error)">O orcamento maximo nao pode ser menor que o minimo.</p>
              )}

              {error && (
                <p className="mt-3 text-(--error)">{error}</p>
              )}

              <div className="flex flex-row-reverse mt-5">
                <Button label={submitting ? "Publicando..." : "Publicar"} buttonType="button" colorType="primary" onClick={handleSubmit} disabled={submitting} />
              </div>
            </div>
          )}

          <div className="flex flex-row-reverse gap-4 mt-5">
            <Button label="Proximo" buttonType="button" colorType="primary" onClick={handleNextStep} disabled={steps === maxSteps} />
            <Button label="Voltar" buttonType="button" colorType="secondary" onClick={handleBackStep} disabled={steps === 1} />
          </div>
        </div>
      </section>
    </>
  );
}
