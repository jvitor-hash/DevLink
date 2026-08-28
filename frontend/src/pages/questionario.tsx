import QuestionarioForm from '../components/questionario_form';

function Questionario() {
  return (
    <div className="w-full">
      <section className="flex flex-col gap-1 max-w-4xl mx-auto mb-5 mt-5 font-sans">
        <p
          className="w-fit mx-auto px-4 py-1 bg-neutral-200/35 dark:text-white
          rounded-full border border-dashed border-black/25 dark:border-white/25 text-base">Três etapas, nenhuma exige saber programar</p>
        <p className="text-xl dark:text-white mx-10">Você não precisa conhecer termos técnicos. As perguntas são objetivas e o sistema organiza tudo no formato ideal que um desenvolvedor precisa.</p>
      </section>

      <section className="max-w-4xl mx-auto mb-5">
        <div tabIndex={0} className="join join-vertical bg-neutral-50 dark:bg-neutral-800 w-full dark:text-white">
          <div className="collapse collapse-arrow join-item border border-black/15 dark:border-white/15">
            <input type="radio" name="my-accordion-4" defaultChecked />
            <div className="collapse-title font-semibold">1. Responda o questionário</div>
            <div className="collapse-content text-sm">Perguntas curtas, de múltipla escolha ou resposta livre, organizadas por tema — da ideia ao orçamento.</div>
          </div>
          <div tabIndex={1} className="collapse collapse-arrow join-item border border-black/15 dark:border-white/15">
            <input type="radio" name="my-accordion-4" />
            <div className="collapse-title font-semibold">2. Transforme em especificação</div>
            <div className="collapse-content text-sm">O sistema organiza automaticamente todas as suas respostas em um documento técnico e estruturado.</div>
          </div>
          <div tabIndex={2} className="collapse collapse-arrow join-item border border-black/15 dark:border-white/15">
            <input type="radio" name="my-accordion-4" />
            <div className="collapse-title font-semibold">3. Publique seu projeto</div>
            <div className="collapse-content text-sm">Após responder todas as etapas, seu projeto estará pronto para ser publicado e orçado.</div>
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
