import { Link } from "react-router-dom";
import Button from "@/components/ui/button_component";
import { scrollToY } from "@/utils/scroll_bus";
import { CategoryCards } from "@/components/ui/category_cards";
import { Blob, FlutedGlass, Shader } from "shaders/react";
import TeamMembersCard from "./team_member_card";
import HowItWorksCard from "./how_it_works_card";

export default function Home() {
  const scrollToHowItWorks = () => {
    const section = document.getElementById("como-funciona");
    if (section) scrollToY(window.scrollY + section.getBoundingClientRect().top - 64);
  };

  return (
    <main>
      <div className="absolute inset-0">
        <div className="absolute w-full h-full top-0 left-0 z-[-1] opacity-50">
          <Shader >
            <FlutedGlass softness={0} highlight={1} lightAngle={45} angle={-45} frequency={15} edges="transparent">
              <Blob colorA="#FF0000" colorB="#FF0000" softness={0.2} highlightIntensity={0} speed={0.35} deformation={0.35} />
            </FlutedGlass>
          </Shader>
        </div>
      </div>

      <section className="w-full overflow-hidden relative">
        <div className="relative grid min-h-[calc(100vh-8rem)] grid-cols-1 items-center gap-8 px-8 py-12 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="mb-4 text-(--text-muted)">transforming ideas into specs</p>

            <h1 className="text-5xl leading-[0.95] mb-6 md:text-6xl">
              Transforme<br />
              suas ideias<br />
              em especificações
            </h1>

            <p className="text-lg mb-8 max-w-xl">
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
            <h4 className="text-3xl">01</h4>

            <div>
              <h2 className="text-2xl">Categorias</h2>

              <p className="mt-1 text-(--text-muted)">Browse by category</p>
            </div>
          </div>

          <div className="border border-(--border-subtle) my-6" />

          <p className="mb-8 max-w-2xl">
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
            <h4 className="text-3xl">02</h4>

            <div>
              <h2 className="text-2xl">Como funciona</h2>

              <p className="mt-1 text-(--text-muted)">How it works</p>
            </div>
          </div>

          <div className="border border-(--border-subtle) my-6" />
        </div>

        <HowItWorksCard/>
      </section>

      {/* 03 Team */}
      <section className="w-full min-h-[60vh] py-16">
        <div className="px-8">
          <div className="flex items-baseline gap-4">
            <h4 className="text-3xl">03</h4>
            <div>
              <h2 className="text-2xl">Quem somos</h2>
              <p className="mt-1 text-(--text-muted)">The team</p>
            </div>
          </div>

          <div className="border border-(--border-subtle) my-4" />
          <p>
            Esta é a nossa equipe de desenvolvedores que ajudaram nesse projeto
          </p>
        </div>

        <ul className="mx-8 mt-10 grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
          <TeamMembersCard team_member_name="João Vitor Alves" team_member_role="Desenvolvedor Full-Stack" />
          <TeamMembersCard team_member_name="Henrick Gualberto" team_member_role="Desenvolvedor Front-End" /> 
          <TeamMembersCard team_member_name="Eduardo Reis" team_member_role="Desenvolvedor Back-End"/>
          <TeamMembersCard team_member_name="Nicolas Motas" team_member_role="Desenvolvedor Full-Stack"/>
          <TeamMembersCard team_member_name="Fabricio Sacramento" team_member_role="Banco de dados"/>
        </ul>
      </section>

      <footer className="px-8 pb-10 pt-8">
        <div className="border border-(--border-subtle) mb-6" />

        <div className="flex flex-col items-start justify-between gap-4 text-sm text-(--text-muted) sm:flex-row sm:items-center">
          <p className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} DevLink</span>
          </p>

          <nav className="flex flex-wrap gap-6">
            <Link to="/project" className="hover:text-(--text-primary) transition-colors">Projetos</Link>
            <Link to="/questionnaire" className="hover:text-(--text-primary) transition-colors">Questionário</Link>
            <Link to="/profile" className="hover:text-(--text-primary) transition-colors">Perfil</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
