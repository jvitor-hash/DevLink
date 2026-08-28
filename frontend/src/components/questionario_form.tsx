import { useState } from "react";

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
  const [pageNum, setPageNum] = useState(0);

  const handleCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = event.target.value;

    setCategory(newCategory);
    setSubCategory(subCategorias[newCategory][0]);
  };

  const handleSubCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSubCategory(event.target.value);
  };

  // Handling pages
  const totalPages = 3;

  const handleNextPage = () => {
    setPageNum((next) => Math.min(next + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setPageNum((prev) => Math.max(prev - 1, 0));
  };

  const progress = ((pageNum + 1) / totalPages) * 100;

  return (
    <div className="card p-5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 shadow-sm">
      <div className="card-title">
        <p className="dark:text-white">Questionário guiado</p>
      </div>

      <div className="card-body p-0 py-2">
        <p className="dark:text-white">Descreva sua ideia com suas palavras</p>
        <div>
          <div className="flex flex-row justify-between dark:text-white">
            <span>Etapas</span>
            <span>
              {pageNum + 1} de {totalPages}
            </span>
          </div>
          <progress className="progress progress-primary w-full" value={progress} max="100"></progress>
        </div>

        {/* Pagina 1 */}
        {pageNum === 0 && (
          <div>
            <div className="mb-3 mt-3">
              <p className="m-0 dark:text-white">Qual será o título do seu projeto?</p>
              <input type="text" placeholder="Digite o título do projeto..." className="input border border-black/25 w-full dark:border-white/25 dark:text-white"/>
            </div>

            <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 dark:text-white">
              {/* Categoria */}
              <div>
                <p className="text-base mb-2">Categoria</p>
                <select value={category} onChange={handleCategory} className="select w-full bg-white dark:bg-neutral-700 border border-black/25 dark:border-white/25">
                  <option value="web">Website</option>
                  <option value="apps">Desenvolvimento de App</option>
                  <option value="mobile">Plataforma Mobile</option>
                  <option value="cybersecurity">Suporte e Cibersegurança</option>
                  <option value="web3">Blockchain & Web3</option>
                </select>
              </div>

              {/* Sub-Categoria */}
              <div>
                <p className="text-base mb-2">Sub-Categoria</p>
                <select value={subCategory} onChange={handleSubCategory} className="select w-full bg-white dark:bg-neutral-700 [&::picker(select)]:max-h-26 border border-black/25 dark:border-white/25">
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
                <p className="text-base mb-2">Qual linguagem de programação será usada?</p>
                <select className="select w-full bg-white dark:bg-neutral-700 border border-black/25 dark:border-white/25" name="programmingLanguage" id="programming-language">
                  <option value="python">Python</option>
                  <option value="javascript">Javascript</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                  <option value="typescript">Typescript</option>
                  <option value="c">C</option>
                  <option value="php">PHP</option>
                  <option value="go">Go (Golang)</option>
                  <option value="rust">Rust</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="swift">Swift</option>
                  <option value="ruby">Ruby</option>
                  <option value="dart">Dart</option>
                  <option value="scala">Scala</option>
                  <option value="r">R</option>
                  <option value="lua">Lua</option>
                  <option value="objectivec">Objective-C</option>
                  <option value="perl">Perl</option>
                  <option value="haskell">Haskell</option>
                </select>
              </div>

              {/* Público-alvo */}
              <div>
                <p className="text-base mb-2">Qual é o público-alvo deste projeto?</p>
                <select defaultValue="clients" className="select w-full bg-white dark:bg-neutral-700 border border-black/25 dark:border-white/25">
                  <option value="me">Pessoal</option>
                  <option value="clients">Clientes</option>
                  <option value="team">Minha equipe</option>
                  <option value="public">Público em geral</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-base dark:text-white">Em qual plataforma este projeto será desenvolvido?</p>
              <div className="flex flex-row gap-5">
                <div className="flex flex-row gap-2 dark:text-white">
                  <p>Web:</p>
                  <input type="checkbox" className="checkbox dark:bg-neutral-800 border border-black/50 dark:border-white/50" />
                </div>
                <div className="flex flex-row gap-2 dark:text-white">
                  <p>Desktop:</p>
                  <input type="checkbox" className="checkbox dark:bg-neutral-800 border border-black/50 dark:border-white/50" />
                </div>
                <div className="flex flex-row gap-2 dark:text-white">
                  <p>Mobile:</p>
                  <input type="checkbox" className="checkbox dark:bg-neutral-800 border border-black/50 dark:border-white/50" />
                </div>
              </div>
            </div>

            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2 mb-3">
              <div>
                <p className="text-base">As pessoas vão precisar criar uma conta ou fazer login?</p>
                <div className="flex flex-row gap-3 dark:text-white">
                  <span className="text-base">Sim</span>
                  <input className="radio" type="radio" name="loginSys" value="Sim" defaultChecked/>
                  <span className="text-base">Não</span>
                  <input className="radio" type="radio" name="loginSys" value="Não"/>
                  <span className="text-base">Talvez</span>
                  <input className="radio" type="radio" name="loginSys" value="Talvez"/>
                </div>
              </div>

              <div>
                <div className="flex flex-row gap-3 dark:text-white">
                  <input className="radio" type="radio" name="payment" value="yes"/>
                  <span className="text-base">Sim</span>
                  <input className="form-check-input" type="radio" name="payment" value="no" defaultChecked/>
                  <span className="text-base">Não</span>
                  <input className="radio" type="radio" name="payment" value="maybe"/>
                  <span className="text-base">Talvez</span>
              </div>
            </div>
          </div>
        )}

        {/* Pagina - 2 */}
        {pageNum === 1 && (
          <div>
            <p className="dark:text-white">test</p>
          </div>
        )}

        {/* Pagina - 3 */}
        {pageNum === 2 && (
          <div>
            <p className="dark:text-white">test 2</p>
            <div className="flex flex-row-reverse gap-5">
              <button type="submit" className="btn bg-success/50 text-white px-10 border border-success">Submit</button>
              <button type="reset" className="btn bg-error/50 text-white px-10 border border-error">Reset</button>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="flex justify-between">
          <button
            type="button"
            className="btn bg-secondary/50 text-white disabled:cursor-not-allowed disabled:text-gray-500 border-secondary px-10"
            onClick={handlePrevPage}
            disabled={pageNum === 0}
            tabIndex={0}
          >Voltar</button>
          <button
            type="button"
            className="btn bg-primary/50 text-black  dark:text-white disabled:cursor-not-allowed border-primary px-10"
            onClick={handleNextPage}
            disabled={pageNum === totalPages - 1}
            tabIndex={1}
          >Proximo</button>
        </div>
      </div>
    </div>
  );
}

export default QuestionarioForm;
