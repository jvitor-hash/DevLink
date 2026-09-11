import Checkbox from "@/components/ui/checkbox_component";
import Input from "@/components/ui/input_component";
import Select from "@/components/ui/select_component";
import TextArea from "@/components/ui/textarea_component";

export default function Questionnaire() {
  // TODO: Validate the user's role and check whether they have the approriate role for this page.

  const categories: Record<string, string[] | null> = {
    Websites: [
      "WordPress",
      "Shopify",
      "Sites personalizados",
      "Wix & Webflow",
      "Squarespace & WooCommerce",
    ],
    "Desenvolvimento de Apps": [
      "Aplicação Full-Stack",
      "Aplicação Desktop & Jogos",
      "Extensão de navegador",
      "Desenvolvimento de APIs",
      "Chatbots AI",
    ],
    "Plataforma Mobile": [
      "Desenvolvimento Mobile",
      "Aplicativos Multiplataforma",
      "Aplicativos Android",
      "Aplicativos iOS",
    ],
    "Suporte e Cibersegurança": [
      "Cloud Computing & DevOps",
      "Cibersegurança",
      "Suporte e TI",
      "Manutenção de Sistemas",
    ],
    "Blockchain & Web3": [
      "Desenvolvimento Blockchains",
      "Apps Descentralizados",
      "Criptomoedas e Tokens",
    ],
  };

  return (
    <>
      <div className="mt-4">
        <h2 className="text-2xl w-full text-center">Criaçao de projetos</h2>
        <p className="text-base text-(--text-muted) text-center">
          Descreva suas ideas aqui e publique para possiveis programadores
        </p>
      </div>

      <div className="mx-4 mt-2 min-w-auto bg-(--surface-1) p-4 rounded-sm border border-(--border)">
        <div className="flex flex-wrap gap-4">
          <div className="w-full">
            <Input label="Titulo" name="" placeholder="Digite o titulo do seu projeto" />
            <div className="flex *:flex-1 gap-4">
              <TextArea label="Descriçao do problema a ser resolvido" name="problem" placeholder="Digite a descricao do seu projeto..." />
              <TextArea label="Requerimentos de interacao do usuario" name="user_actions" placeholder="Descreva as interacoes necessarias do sistema com os usuarios..." />
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <p>Categoria:</p>
              <Select
                labels={{
                  Websites: "websites",
                  "Desenvolvimento de Apps": "Desenvolvimento de Apps",
                  "Plataforma Mobile": "Plataforma Mobile",
                  "Suporte e Cibersegurança": "Suporte e Cibersegurança",
                  "Blockchain & Web3": "Blockchain & Web3",
                }}
                name="category"
              />
            </div>

            <div className="hidden">
              <p>Sub-Categoria:</p>
              <Select labels={{}} name="sub_category" />
            </div>

            <div>
              <p>Linguagem de programaçao:</p>
              <Select labels={{
                Python: "PYTHON",
                "C#": "CSHARP",
                "Node.js" :"NODE_JS",
                Java:"JAVA",
                GO: "GO",
                Typescript: "TYPESCRIPT",
                Javascript: "JAVASCRIPT",
                PHP: "PHP",
                Rust: "RUST",
                Kotlin: "KOTLIN",
                Swift:  "SWIFT"
              }} name="primary_language" />
            </div>

            <div>
              <p>Publico-alvo:</p>
              <Select labels={{
                Clientes: "CLIENTS",
                "Ferramenta Interna": "INTERNAL_TOOL",
                Empresas: "BUSINESSES",
                Estudantes: "STUDENTS",
                Administradores: "ADMINISTRATORS",
                Pesquisadores: "RESEARCHER"
              }} name="sub_category" />
            </div>
          </div>
        </div>

        <div>
          <p>Plataformas:</p>
          <div className="flex gap-4">
            <Checkbox label="Web"/>
            <Checkbox label="Desktop"/>
            <Checkbox label="Mobile"/>
          </div>
        </div>
      </div>
    </>
  );
}
