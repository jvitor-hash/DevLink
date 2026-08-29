import QuestionarioForm from '../components/questionario_form';

function Questionario() {
  return (
    <div className="w-full">
      <section className="flex flex-col gap-1 max-w-4xl mx-auto mb-5 mt-5 font-sans">
        <p
          className="w-fit mx-auto px-4 py-1 bg-neutral-200/35 dark:text-white
          rounded-full border border-dashed border-black/25 dark:border-white/25 text-base">Três etapas, nenhuma exige saber programar</p>
        <h1 className="text-2xl dark:text-white font-bold mx-10">Como funciona?</h1>
        <p className="text-xl dark:text-white mx-10">Você não precisa conhecer termos técnicos. As perguntas são objetivas e o sistema organiza tudo no formato ideal que um desenvolvedor precisa.</p>
      </section>

      <section className="w-full mx-auto mb-10">
        <div className="flex flex-row justify-center gap-5 dark:text-white">
          <div className="card bg-neutral-50 border border-black/5 dark:border-white/5 dark:bg-neutral-800 dark:text-white p-4 max-w-xs shadow-md">
            <div className="card-title">
              <h4 className="font-semibold">1. Responda o questionário</h4>
            </div>
            <div className="card-body">
              <p className="text-base">Perguntas curtas, de múltipla escolha ou resposta livre, organizadas por tema — da ideia ao orçamento.</p>
            </div>
          </div>

          <div className="card bg-neutral-50 border border-black/5 dark:border-white/5 dark:bg-neutral-800 dark:text-white p-4 max-w-xs shadow-md">
            <div className="card-title ">
              <h4 className="font-semibold">2. Transforme em especificação</h4>
            </div>
            <div className="card-body">
              <p className="text-base">O sistema organiza automaticamente todas as suas respostas em um documento técnico e estruturado.</p>
            </div>
          </div>

          <div className="card bg-neutral-50 border border-black/5 dark:border-white/5 dark:bg-neutral-800 dark:text-white p-4 max-w-xs shadow-md">
            <div className="card-title ">
              <h4 className="font-semibold">1. Responda o questionário</h4>
            </div>
            <div className="card-body">
              <p className="text-base">Perguntas curtas, de múltipla escolha ou resposta livre, organizadas por tema — da ideia ao orçamento.</p>
            </div>
          </div>
        </div>
      </section>

      <section tabIndex={3} className="max-w-4xl mx-auto">
        <form>
          <QuestionarioForm/>
        </form>
      </section>
    </div>
  )
}

export default Questionario;
