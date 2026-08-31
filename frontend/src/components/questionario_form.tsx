import { useState } from "react";
import SelectorTemplate from "./selector_template.tsx";
import CheckboxTemplate from "./checkbox_template.tsx";
import RadioTemplate from "./radio_template.tsx";

function QuestionarioForm() {
  const subCategorias: Record<string, string[]> = {
    web: [
      "WordPress",
      "Shopify",
      "Sites personalizados",
      "Wix & Webflow",
      "Squarespace & WooCommerce",
    ],

    apps: [
      "Aplicação Full-Stack",
      "Aplicação Desktop & Jogos",
      "Extensão de navegador",
      "Desenvolvimento de APIs",
      "Chatbots AI",
    ],

    mobile: [
      "Desenvolvimento Mobile",
      "Aplicativos Multiplataforma",
      "Aplicativos Android",
      "Aplicativos iOS",
    ],

    cybersecurity: [
      "Cloud Computing & DevOps",
      "Cibersegurança",
      "Suporte e TI",
      "Manutenção de Sistemas",
    ],

    web3: [
      "Desenvol. Blockchains",
      "Apps Descentralizados",
      "Criptomoedas e Tokens",
      "Manutenção de Sistemas",
    ],
  };

  const [category, setCategory] = useState("web");
  const [subCategory, setSubCategory] = useState(subCategorias.web[0]);

  const handleCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = event.target.value;

    setCategory(newCategory);
    setSubCategory(subCategorias[newCategory][0]);
  };

  const handleSubCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSubCategory(event.target.value);
  };

  return (
    <div className="card p-5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 shadow-sm">
      <div className="card-title">
        <p className="dark:text-white">Questionário guiado</p>
      </div>

      <div className="card-body p-0 py-2">
        <p className="dark:text-white">Descreva sua ideia com suas palavras</p>

        <div>
          <div className="mb-3 mt-3">
            <p className="text-base mb-2 dark:text-white">Qual será o título do seu projeto?</p>
            <input type="text" placeholder="Digite o título do projeto..." className="input bg-white dark:bg-neutral-800 border border-black/25 w-full dark:border-white/25 dark:text-white" />
          </div>

          <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 dark:text-white">
            {/* Categoria */}
            <div>
              <SelectorTemplate title="Categoria" onChange={handleCategory} options={[
                { name: "Website",                  value: "web"           },
                { name: "Desenvolvimento de App",   value: "apps"          },
                { name: "Plataforma Mobile",        value: "mobile"        },
                { name: "Suporte e Cibersegurança", value: "cybersecurity" },
                { name: "Blockchain & Web3",        value: "web3"          }
              ]} />
            </div>

            {/* Sub-Categoria */}
            <div>
              <p className="text-base mb-2">Sub-Categoria</p>
              <select value={subCategory} onChange={handleSubCategory} className="select w-full bg-white dark:bg-neutral-800 border border-black/25 dark:border-white/25">
                {subCategorias[category].map((elem) => (
                  <option key={elem} value={elem}>
                    {elem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 dark:text-white">
            {/* Linguagem */}
            <div>
              <SelectorTemplate title="Qual linguagem de programação será usada?" options={[
                { name: "Python",      value: "python"     },
                { name: "Javascript",  value: "javascript" },
                { name: "Java",        value: "java"       },
                { name: "C#",          value: "csharp"     },
                { name: "C++",         value: "cpp"        },
                { name: "Typescript",  value: "typescript" },
                { name: "C",           value: "c"          },
                { name: "PHP",         value: "php"        },
                { name: "Go",          value: "golang"     },
                { name: "Rust",        value: "rust"       },
                { name: "Kotlin",      value: "kotlin"     },
                { name: "Swift",       value: "swift"      },
                { name: "Dart",        value: "dart"       },
                { name: "Scala",       value: "scala"      },
                { name: "R",           value: "r"          },
                { name: "Lua",         value: "lua"        },
                { name: "Objective-C", value: "objectivec" },
                { name: "Perl",        value: "perl"       },
                { name: "Haskell",     value: "haskell"    }
              ]}/>
            </div>

            {/* Público-alvo */}
            <SelectorTemplate title="Qual é o público-alvo deste projeto?" options={[
              { name: "Pessoal",          value: "personal" },
              { name: "Clientes",         value: "clients"  },
              { name: "Minha Equipe",     value: "team"     },
              { name: "Público em geral", value: "public"   }
            ]}/>
          </div>

          {/* Plataforma */}
          <CheckboxTemplate title="Em qual plataforma este projeto será desenvolvido?" options={[
            { label: "Web"     },
            { label: "Desktop" },
            { label: "Mobile"  }
          ]}/>

          <div className="grid grid-rows-2 grid-cols-1 md:grid-cols-2 mb-3">
            {/* Sistema de login */}
            <RadioTemplate title="As pessoas vão precisar criar uma conta ou fazer login?" options={[
              { label: "Sim",    value: "yes"   },
              { label: "Não",    value: "no"    },
              { label: "Talvez", value: "maybe" }
            ]} name="loginSys" />

            {/* Sistema de pagamento */}
            <RadioTemplate title="Vai envolver pagamento dentro do sistema?" options={[
              { label: "Sim",    value: "yes"   },
              { label: "Não",    value: "no"    },
              { label: "Talvez", value: "maybe" }
            ]} name="payment" />

            {/* Painel administrativo */}
            <RadioTemplate title="Vai ter algum painel administrativo para gerenciar o conteúdo?" options={[
              { label: "Sim",    value: "yes"   },
              { label: "Não",    value: "no"    },
            ]} name="adminPanel" />

            {/* Identidade visual/Branding */}
            <RadioTemplate title="Já tem logo ou identidade visual pronta?" options={[
              { label: "Sim",    value: "yes"   },
              { label: "Não",    value: "no"    },
            ]} name="branding" />
          </div>

          <div className="mb-3">
            <p className="text-base dark:text-white">O que o usuário precisa conseguir fazer?</p>
            <textarea className="textarea dark:bg-neutral-800 border border-black/25 dark:border-white/25 w-full resize-none"></textarea>
          </div>

          <div className="mb-3">
            <p className="text-base mb-2 dark:text-white">Você tem alguma cor ou estilo visual em mente?</p>
            <input type="text" placeholder="Ex: Tons de azul, estilo minimalista e moderno" className="input bg-white dark:bg-neutral-800 border border-black/25 w-full dark:border-white/25 dark:text-white" />
          </div>

          <div className="mb-3">
            <p className="text-base mb-2 dark:text-white">Tem algum site ou app que você quer usar de inspiração?</p>
            <input type="text" placeholder="Opcional: Cole links ou nomes de referências" className="input bg-white dark:bg-neutral-800 border border-black/25 w-full dark:border-white/25 dark:text-white" />
          </div>

          <SelectorTemplate title="Quando você gostaria que estivesse pronto?" options={[
            { name: "1 Dia",    value: "1day"    },
            { name: "1 Semana", value: "1week"   },
            { name: "1 Mês",    value: "1month"  },
            { name: "3 Meses",  value: "3months" },
            { name: "6 Meses",  value: "6months" },
            { name: "1 Ano",    value: "1year"   },
            { name: "1+ Anos",  value: "nyears"  }
          ]} />

          <div className="mt-3 mb-3 w-full dark:text-white">
            <p className="text-base">Valor planejado para investimento (R$)</p>
            <div className="flex gap-5">
              <label className="input">
                <span>R$</span>
                <input type="number" placeholder="Valor minimo" className="input validator border border-black/25 dark:border-white/25" min={0} max={999999} />
              </label>

              <label className="input">
                <span>R$</span>
                <input type="number" placeholder="Valor maximo" className="input validator border border-black/25 dark:border-white/25" min={0} max={999999} />
              </label>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex justify-between">
          <button type="reset" className="btn bg-primary/50 text-black dark:text-white border-primary px-10">Reset</button>
          <button type="button" className="btn bg-success/50 text-black  dark:text-white border-success px-10">Submit</button>
        </div>
      </div>
    </div>
  )
}

export default QuestionarioForm;
