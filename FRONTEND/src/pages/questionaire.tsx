import { QuestionaireWizard } from "@/features/questionaire/component/questionaire_wizard";

export default function Questionaire() {
  return (
    <div className="mx-auto w-full px-4 py-8">
      <header className="mb-6 border-b border-(--border-subtle) pb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
          Criação de Projetos
        </h1>
        <p className="text-sm text-(--text-secondary) mt-1">
          Descreva suas ideias passo a passo e publique para que programadores qualificados possam se candidatar.
        </p>
      </header>

      <QuestionaireWizard />
    </div>
  );
}
