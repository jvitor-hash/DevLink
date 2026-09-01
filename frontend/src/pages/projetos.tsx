import { useState } from 'react';
import CheckboxTemplate from "../components/checkbox_template.tsx";
import SelectorTemplate from "../components/selector_template.tsx";

export default function Projetos() {
  const [results, setResults] = useState(0);

  return (
    <>
      <section>
        <div className="flex w-full px-2 mb-5">
          <form className="w-full">
            {/* Pesquisa */}
            <div className="flex gap-3 mb-3 mt-5">
              <input type="text" className="flex-10 input border border-black/25 dark:border-white/25 dark:bg-neutral-800 dark:text-white" placeholder="Buscar novos projetos/clientes" />
              <button className="flex-1 btn bg-primary/50 hover:bg-primary hover:text-white border-primary text-black dark:text-white">Buscar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-end">
              <div>
                {/* Orçamento */}
                <p>Orçamento:</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="input">
                    <span>R$</span>
                    <input type="number" placeholder="Valor mínimo" className="input validator border border-black/25 dark:border-white/25" min={0} max={999999}/>
                  </label>

                  <label className="input">
                    <span>R$</span>
                    <input type="number" placeholder="Valor máximo" className="input validator border border-black/25 dark:border-white/25" min={0} max={999999} />
                  </label>
                </div>
              </div>

              <div>
                {/* Prazo de entrega */}
                <SelectorTemplate title="Prazo:" options={[
                    { name: "1 Dia", value: "1day" },
                    { name: "1 Semana", value: "1week" },
                    { name: "1 Mês", value: "1month" },
                    { name: "3 Meses", value: "3months" },
                    { name: "6 Meses", value: "6months" },
                    { name: "1 Ano", value: "1year" },
                    { name: "1+ Anos", value: "nyears" }
                ]} />
              </div>

              <div>
                {/* Plataforma */}
                <CheckboxTemplate title="Plataforma:" options={[
                    { label: "Web" },
                    { label: "Desktop" },
                    { label: "Mobile" }
                ]} />
              </div>

              <div>
                {/* Categoria */}
                <SelectorTemplate title="Categoria" options={[
                    { name: "Website", value: "web" },
                    { name: "Desenvolvimento de App", value: "apps" },
                    { name: "Plataforma Mobile", value: "mobile" },
                    { name: "Suporte e Cibersegurança", value: "cybersecurity" },
                    { name: "Blockchain & Web3", value: "web3" }
                ]} />
              </div>
            </div>
          </form>
        </div>
      </section>

      <section>
        <p className="text-xl">Resultados: { results }</p>
        <div className="flex"></div>
        <div className="card bg-white dark:bg-neutral-800 border border-black/15 dark:border-white/15 shadow-sm max-w-xl">
          <div className="card-body">
            <p className="text-base">TEADSAJD</p>
          </div>
        </div>
      </section>
    </>
  )
}
