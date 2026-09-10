import { ProjectModal } from "@/components/layout/project_modal_layout";
import Button from "@/components/ui/button_component";
import Input from "@/components/ui/input_component";
import ProjectPreview from "@/components/ui/project_ticket_component";
import Select from "@/components/ui/select_component";
import { cache } from "@/lib/hooks/useCache";
import type { ProjectDTO } from "@/lib/types/database";
import { projectService } from "@/services/project_service";
import { Suspense, useEffect, useState } from "react";
import { ChevronRight } from "react-feather";
import { useSearchParams } from "react-router-dom";

export default function ProjectPage() {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectDTO[] | null>(null);

  // URL params filters.
  const URL_category: string | null = searchParams.get("category");
  const URL_subCategory: string | null = searchParams.get("sub_category");

  // Pagination
  const limit: number | null = Number(searchParams.get("limit"));
  const offset: number | null = Number(searchParams.get("offset"));

  useEffect(() => {
    const retrieve_projects = async () => {
      const request_projects = await projectService.list({ limit: limit || 10, offset: offset || 0 });
      cache.set("projects", request_projects);

      setProjects(request_projects
        .filter((project) => project.category === URL_category || project.sub_category === URL_subCategory)
      )
    };

    const filter_projects_cache = (cached_projects: ProjectDTO[] | null): void => {
      if (cached_projects === null) return;
      setProjects(
        cached_projects
          .filter((project) => project.category === URL_category || project.sub_category === URL_subCategory)
      );
    }

    const cached_projects = cache.get<ProjectDTO[] | null>("projects");

    if (!cached_projects)
      // Not ideal but oh well.
      retrieve_projects();
    else
      filter_projects_cache(cached_projects);

  }, [limit, offset, URL_category, URL_subCategory]);

  // Overrites the cache data with refreshed new data.
  // Must be triggered manually to work otherwise it will
  // keep using stale data from the in-memory cache.
  const invalidateCacheData = async () => {
    const request_projects = await projectService.list({ limit: limit || 10, offset: offset || 0 });
    cache.set("projects", request_projects);

    setProjects(request_projects
      .filter((project) => project.category === URL_category || project.sub_category === URL_subCategory)
    )
  };

  return (
    <>
      <section>
        <form className="relative mx-25 max-h-fit">
          <Input icon="search" label="" inputType="text" placeholder="Busque por novos projetos..." />
          <Button className="absolute right-2 top-8 -translate-y-1/2" label="Pesquisar" buttonType="submit"/>
          {/* Filters */}
          <div className="flex gap-10">
            <p>Público-alvo:</p>
            <p>Plataformas:</p>
            <p>Linguagem:</p>
            <p>Status:</p>
            <p>Orçamento:</p>
          </div>
          <div className="flex gap-10 mt-2">
            {/* Each row as a flex container */}
            <Select labels={{ "Clientes": "CLIENTS", "Ferramenta Interna": "INTERNAL TOOL", "Estudantes": "STUDANTS", "Negocios": "BUSINESSES", "Administradores": "ADMINISTRATOR", "Pesquisadores": "RESEARCHER" }} name="audience" />
            <Select labels={{ Web: "WEB", Desktop: "DESKTOP", Mobile: "MOBILE" }} name="platforms" />
            <Select labels={{ Python: "PYTHON", Typescript: "TYPESCRIPT", "C#": "CSHARP" }} name="primary_language" />
            <Select labels={{ "Em-aberto": "OPEN", Fechado: "CLOSED", "Em negociacao": "NEGOTIATION" }} name="status" />
            <Input placeholder="R$ 000" inputType="number" label="" />
            <Input placeholder="R$ 000" inputType="number" label="" />
          </div>
        </form>
      </section>

      <section className="mx-25">
        <div className="mb-5 mt-5">
          <div className="flex justify-between">
            <h1 className="text-2xl text-(--text-primary) mb-3"><span className="text-white text-3xl">*</span>Highlights desta semana:</h1>
            <button className="group flex items-center hover:cursor-pointer">Ver mais<ChevronRight className="inline transition-all group-hover:mx-2" /></button>
          </div>
          <div className="border-b border-b-(--error)"></div>
        </div>
        <div className="grid">
          {projects !== null && projects.map((project) => (
            <ProjectPreview
              item={project.id}
              title={project.title}
              category={project.category}
              deadline={project.completedAt}
              problem={project.problem}
              actions={project.user_actions}
              audience={project.audience}
              programming_language={project.primaryLanguage}
              platforms={project.platforms}
              status={project.status}
              maxBudget={project.maxBudget}
              minBudget={project.minBudget}
              key={project.id}
            />
          ))}
        </div>
      </section>

      <section className="mx-25">
        <div className="mb-5 mt-5">
          <div className="flex justify-between">
            <h1 className="text-2xl text-(--text-primary) mb-3">Projetos em aberto:</h1>
            <button className="group flex items-center hover:cursor-pointer">Ver mais<ChevronRight className="inline transition-all group-hover:mx-2" /></button>
          </div>
          <div className="border-b border-b-(--error)"></div>
        </div>
        <div className="grid">
          <ProjectPreview
            item="456"
            title="E-commerce Website for Local Fashion Brand"
            category="Websites"
            deadline="October 30, 2026"
            problem="We need a modern, mobile-friendly online store to showcase our products and make it easier for customers to purchase online."
            audience="Clientes"
            platforms={["Web", "Desktop"]}
            status="OPEN"
            actions="Design UI/UX. Develop website. Integrate payments. Deploy"
            programming_language="Python"
            minBudget={1500}
            maxBudget={3000}
          />
        </div>
      </section>

      <Suspense fallback={null}>
        <ProjectModal />
      </Suspense>
    </>
  );
}
