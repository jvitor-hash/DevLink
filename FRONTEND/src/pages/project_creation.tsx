import Input from "@/components/ui/input_component";
import Select from "@/components/ui/select_component";

export default function ProjectCreation() {
  // TODO: Validate the user's role and check whether they have the approriate role for this page.

  const categories: Record<string, string[] | null> = {
    Websites: [
      "WordPress",
      "Shopify",
      "Sites personalizados",
      "Wix & Webflow",
      "Squarespace & WooCommerce"
    ],
    "Desenvolvimento de Apps": [
      "Aplicação Full-Stack",
      "Aplicação Desktop & Jogos",
      "Extensão de navegador",
      "Desenvolvimento de APIs",
      "Chatbots AI"
    ],
    "Plataforma Mobile": [
      "Desenvolvimento Mobile",
      "Aplicativos Multiplataforma",
      "Aplicativos Android",
      "Aplicativos iOS"
    ],
    "Suporte e Cibersegurança": [
      "Cloud Computing & DevOps",
      "Cibersegurança",
      "Suporte e TI",
      "Manutenção de Sistemas"
    ],
    "Blockchain & Web3": [
      "Desenvolvimento Blockchains",
      "Apps Descentralizados",
      "Criptomoedas e Tokens"
    ]
  }

  return (
    <>
      <div className="mt-4">
        <h2 className="text-2xl w-full text-center">Criacao de projetos</h2>
        <p className="text-base text-(--text-muted) text-center">Descreva suas ideas aqui e publique para possiveis programadores</p>
      </div>

      <div className="mx-4 mt-2 min-w-auto bg-(--surface-1) p-4 rounded-sm border border-(--border)">
        <div className="grid grid-cols-3">
          <Input label="Titulo" placeholder="Digite o titulo do seu projeto" />
          <div>
            <p>Categoria:</p>
            <Select labels={{
              Websites: 'websites',
              "Desenvolvimento de Apps":  'Desenvolvimento de Apps',
              "Plataforma Mobile":        'Plataforma Mobile',
              "Suporte e Cibersegurança": 'Suporte e Cibersegurança',
              "Blockchain & Web3":        'Blockchain & Web3'
            }} name="category"/>
          </div>

          <div>
            <p>Sub-Categoria:</p>
            <Select labels={{

            }} name="sub_category"/>
          </div>
        </div>
      </div>
    </>
  )
}
