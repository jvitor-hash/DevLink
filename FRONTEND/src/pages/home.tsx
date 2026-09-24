import { Link } from "react-router-dom";
import Button from "@/components/ui/button_component";
import WaveEffect from "@/components/ui/wave_shader_component";
import { scrollToY } from "@/lib/utils/scroll_bus";
import { CategoryCards } from "../components/layout/category_cards";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Descreva a ideia",
    body: "Responda o questionário guiado sobre problema e público.",
  },
  {
    step: "2",
    title: "Publique o projeto",
    body: "A especificação vira um projeto visível para desenvolvedores.",
  },
  {
    step: "3",
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
      <section className="w-full min-h-screen overflow-hidden">
        <WaveEffect />

        <div className="relative grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-8 px-8 md:grid-cols-2">
          <div className="max-w-xl">
            <h1 className="text-6xl mb-5">
              Transforme suas ideias em <br />especificações técnicas.
            </h1>
            <p className="text-lg mb-5 text-(--text-muted)">
              Tire suas ideias do papel e transforme-as em planos técnicos objetivos.
            </p>
            <div className="flex gap-4">
              <Button label="Questionário" colorType="primary" buttonType="button" href="/questionnaire" />
              <Button label="Como funciona?" colorType="secondary" buttonType="button" onClick={scrollToHowItWorks} />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full min-h-screen py-16">
        <p className="text-3xl text-center w-full mb-2">Categorias</p>
        <p className="text-lg text-(--text-muted) w-full text-center mb-3">
          Pesquise por categoria e encontre o projeto que procura.
        </p>

        <div className="mx-8">
          <CategoryCards />
        </div>
      </section>

      <section id="como-funciona" className="w-full min-h-screen scroll-mt-16 py-16">
        <p className="text-3xl text-center w-full mb-10">Como funciona</p>

        <div className="mx-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, body }) => (
            <div
              key={step}
              className="rounded-xl border border-(--border-subtle) bg-(--surface-1) p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary) text-sm font-bold text-white">
                  {step}
                </span>
                <h3 className="text-lg font-bold text-(--text-primary)">{title}</h3>
              </div>
              <p className="text-sm text-(--text-secondary)">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full min-h-[60vh] py-16">
        <p className="text-3xl text-center w-full mb-2">Quem somos</p>
        <p className="text-lg text-(--text-muted) w-full text-center mb-10">
          Esta é a nossa equipe de desenvolvedores que ajudaram nesse projeto
        </p>

        <div className="mx-8 flex flex-wrap justify-center gap-6">
          {TEAM_MEMBERS.map(({ name, role }) => (
            <div
              key={name}
              className="flex w-64 flex-col items-center rounded-xl border border-(--border-subtle) bg-(--surface-1) p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--surface-2) text-2xl font-bold text-(--text-muted)">
                {name.charAt(0)}
              </div>
              <p className="mt-4 font-semibold text-(--text-primary)">{name}</p>
              <p className="mt-1 text-xs text-(--text-muted)">{role}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-(--border-subtle) py-6">
        <div className="flex flex-col items-center justify-between gap-2 px-8 text-sm text-(--text-muted) sm:flex-row">
          <p>© {new Date().getFullYear()} DevLink</p>
          <div className="flex gap-6">
            <Link to="/project" className="hover:text-(--text-primary) transition-colors">Projetos</Link>
            <Link to="/questionnaire" className="hover:text-(--text-primary) transition-colors">Questionário</Link>
            <Link to="/profile" className="hover:text-(--text-primary) transition-colors">Perfil</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
