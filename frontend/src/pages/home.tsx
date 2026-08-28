import CategoryCard from "../components/category_card";

function Home() {
  return (
    <div className="w-full">
      <section className="hero bg-neutral-900 grid-background dark:text-white py-52">
        <div className="hero-content text-center w-full">
          <div className="flex flex-col items-center max-w-2xl gap-10 mx-auto">
            <h1 className="text-6xl text-white">Transforme suas ideias em especificaçoes técnicas.</h1>
            <div className="w-fit mx-auto px-4 py-1 bg-neutral-700/50 rounded-full border border-dashed border-white/50 text-primary">Do jeito que o cliente fala <i className="bi bi-arrow-right"></i> do jeito que o programador precisa</div>
          </div>
        </div>
      </section>

      <section className="grid grid-rows-2 grid-cols-1 lg:grid-cols-4 gap-10 p-15">
        <CategoryCard title="Websites" links={[
          { label: "WordPress",                 to: "/" },
          { label: "Shopify",                   to: "/" },
          { label: "Sites personalizados",      to: "/" },
          { label: "Wix & Webflow",             to: "/" },
          { label: "Squarespace & WooCommerce", to: "/" },
        ]} />

        <CategoryCard title="Desenvolvimento de Apps" links={[
          { label: "Aplicação Full-Stack",      to: "/"},
          { label: "Aplicação Desktop & Jogos", to: "/"},
          { label: "Extensão de navegador",     to: "/"},
          { label: "Desenvolvimento de APIs",   to: "/"},
          { label: "Chatbots AI",               to: "/"}
        ]} />

        <CategoryCard title="Plataforma Mobile" links={[
          { label: "Desenvolvimento Mobile",      to: "/" },
          { label: "Aplicativos Multiplataforma", to: "/" },
          { label: "Aplicativos Android",         to: "/" },
          { label: "Aplicativos iOS",             to: "/" },
        ]} />

        <CategoryCard title="Suporte e Cibersegurança" links={[
          { label: "Cloud Computing & DevOps",  to: "/" },
          { label: "Cibersegurança",            to: "/" },
          { label: "Suporte e TI",              to: "/" },
          { label: "Manutenção de Sistemas",    to: "/" },
        ]} />

        <CategoryCard title="Blockchain & Web3" links={[
          { label: "Desenvol. Blockchains",  to: "/" },
          { label: "Apps Descentralizados",  to: "/" },
          { label: "Criptomoedas e Tokens",  to: "/" },
          { label: "Manutenção de Sistemas", to: "/" },
        ]} />
      </section>
    </div>
  )
}

export default Home;
