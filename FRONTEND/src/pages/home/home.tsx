import { Link } from "react-router-dom";
import Button from "@/components/ui/button_component";
import WaveEffect from "@/components/ui/wave_shader_component";
import { scrollToY } from "@/utils/scroll_bus";
import { CategoryCards } from "@/components/ui/category_cards";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Descreva a ideia",
    body: "Responda o questionário guiado sobre problema e público.",
  },
  {
    step: "02",
    title: "Publique o projeto",
    body: "A especificação vira um projeto visível para desenvolvedores.",
  },
  {
    step: "03",
    title: "Receba propostas",
    body: "Negocie prazo e orçamento pelo chat do projeto.",
  },
] as const;

const TEAM_MEMBERS = [
  { name: "Dev 1", role: "Desenvolvedor Full-Stack" },
  { name: "Dev 2", role: "Desenvolvedor Front-End" },
  { name: "Dev 3", role: "Desenvolvedor Back-End" },
  { name: "Dev 4", role: "Desenvolvedor Mobile" },
  { name: "Dev 5", role: "Desenvolvedor DevOps" },
] as const;

export default function Home() {
  const scrollToHowItWorks = () => {
    const section = document.getElementById("como-funciona");

    if (section) scrollToY(window.scrollY + section.getBoundingClientRect().top - 64);
  };

  return (
    <main>
      {/* Cover: headline plus a vertical Japanese column */}
      <section className="w-full overflow-hidden">
        <WaveEffect />

        <div className="relative grid min-h-[calc(100vh-8rem)] grid-cols-1 items-center gap-8 px-8 py-12 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="gb-kicker mb-4">transforming ideas into specs</p>

            <h1 className="gb-heading text-5xl leading-[0.95] mb-6 md:text-6xl">
              Transforme<br />
              suas ideias<br />
              em especificações
            </h1>

            <p className="gb-body text-lg mb-8 max-w-xl">
              Tire suas ideias do papel e transforme-as em planos técnicos objetivos.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button label="Questionário" colorType="primary" buttonType="button" href="/questionnaire" />
              <Button label="Como funciona?" colorType="secondary" buttonType="button" onClick={scrollToHowItWorks} />
            </div>
          </div>
        </div>
      </section>

      {/* 01 Categories */}
      <section className="w-full py-16">
        <div className="px-8">
          <div className="flex items-baseline gap-4">
            <span className="gb-heading text-4xl">01</span>

            <div>
              <h2 className="gb-heading text-2xl">Categorias</h2>

              <p className="gb-kicker mt-1">Browse by category</p>
            </div>
          </div>

          <div className="gb-rule-heavy my-6" />

          <p className="gb-body mb-8 max-w-2xl">
            Pesquise por categoria e encontre o projeto que procura.
          </p>
        </div>

        <div className="mx-8">
          <CategoryCards />
        </div>
      </section>

      {/* 02 How it works */}
      <section id="como-funciona" className="w-full scroll-mt-16 py-16">
        <div className="px-8">
          <div className="flex items-baseline gap-4">
            <span className="gb-heading text-4xl">02</span>

            <div>
              <h2 className="gb-heading text-2xl">Como funciona</h2>

              <p className="gb-kicker mt-1">How it works</p>
            </div>
          </div>

          <div className="gb-rule-heavy my-6" />
        </div>

        <div className="mx-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, body }) => (
            <div key={step} className="bg-(--surface-1) border border-(--border-subtle) p-6">
              <div className="mb-4 flex items-baseline gap-3">
                <span className="gb-heading text-4xl text-(--primary)">{step}</span>
                <h3 className="gb-heading text-lg">{title}</h3>
              </div>

              <div className="border border-(--border) my-4" />
              <p className="gb-body text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 03 Roster */}
      <section className="w-full min-h-[60vh] py-16">
        <div className="px-8">
          <div className="flex items-baseline gap-4">
            <span className="gb-heading text-4xl">03</span>

            <div>
              <h2 className="gb-heading text-2xl">Quem somos</h2>

              <p className="gb-kicker mt-1">The team</p>
            </div>
          </div>

          <div className="gb-rule-heavy my-6" />

          <p className="gb-body max-w-2xl">
            Esta é a nossa equipe de desenvolvedores que ajudaram nesse projeto
          </p>
        </div>

        <ul className="mx-8 mt-10 grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map(({ name, role }) => (
            <li key={name} className="border-b border-(--border-subtle) py-5 relative">
              <div className="flex flex-col">
                <span className="gb-heading text-xl z-10">{name}</span>
                <p className="gb-body mt-2 text-sm z-10">{role}</p>

                <span className="absolute mask-[linear-gradient(to_left,white_35%,transparent_100%)] gb-halftone h-[70%] w-full text-(--primary) z-0" aria-hidden="true" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Colophon */}
      <footer className="px-8 pb-10 pt-8">
        <div className="gb-rule-heavy mb-6" />

        <div className="flex flex-col items-start justify-between gap-4 text-sm text-(--text-muted) sm:flex-row sm:items-center">
          <p className="flex items-center gap-4">
            <span className="gb-kicker">© {new Date().getFullYear()} DevLink</span>
          </p>

          <nav className="flex flex-wrap gap-6">
            <Link to="/project" className="gb-kicker hover:text-(--text-primary) transition-colors">Projetos</Link>
            <Link to="/questionnaire" className="gb-kicker hover:text-(--text-primary) transition-colors">Questionário</Link>
            <Link to="/profile" className="gb-kicker hover:text-(--text-primary) transition-colors">Perfil</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
