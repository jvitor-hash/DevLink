import { ProjectModal } from "@/components/layout/project_modal_layout";
import Button from "@/components/ui/button_component";
import Input from "@/components/ui/input_component";
import ProjectPreview from "@/components/ui/project_ticket_component";
import { Suspense } from "react";
import { ChevronRight } from "react-feather";

export default function ProjectPage() {
  return (
    <>
      <section>
        <div className="relative mx-25 max-h-fit">
          <Input icon="search" label="" inputType="text" placeholder="Busque por novos projetos..." />
          <Button className="absolute right-2 top-8 -translate-y-1/2" label="Pesquisar" buttonType="submit"/>
        </div>
      </section>

      <section className="mx-25">
        <div className="mb-5 mt-5">
          <div className="flex justify-between">
            <h1 className="text-2xl text-(--text-primary) mb-3"><span className="font-extrabold text-white text-3xl">*</span>Highlights desta semana:</h1>
            <button className="group flex items-center hover:cursor-pointer">Ver mais<ChevronRight className="inline transition-all group-hover:mx-2" /></button>
          </div>
          <div className="border-b border-b-(--error)"></div>
        </div>
        <div className="grid">
          <ProjectPreview
            item="123"
            title="E-commerce Website for Local Fashion Brand"
            category="Websites"
            deadline="October 30, 2026"
            problem="We need a modern, mobile-friendly online store to showcase our products and make it easier for customers to purchase online."
            audience="Clientes"
            platforms={["Web", "Desktop"]}
            actions="Design UI/UX. Develop website. Integrate payments. Deploy"
            programming_language="Python"
            minBudget={1500}
            maxBudget={3000}
          />
        </div>
      </section>

      <section className="mx-25">
        <div className="mb-5 mt-5">
          <div className="flex justify-between">
            <h1 className="text-2xl text-(--text-primary) mb-3"><span className="font-extrabold text-white text-3xl">*</span>Highlights desta semana:</h1>
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
