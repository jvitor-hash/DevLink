import { FlutedGlass, Blob, Shader } from "shaders/react";
import { MessageCircle, PlusCircle, ArrowDown } from "react-feather";
import { ULIB } from "@/shared/ui";
import { useRedirect } from "@/shared/hooks/use_redirect";
import { scrollToElement } from "@/shared/utils/page_scrolling";

export default function HomePage() {
  const redirect = useRedirect();

  const handleScrollToVantagens = () => {
    scrollToElement(document.getElementById("vantagens"));
  };

  return (
    <>
      {/* Background Shader */}
      <div className="absolute inset-0 block">
        <div className="absolute w-full h-full top-0 left-0 opacity-50">
          <Shader>
            <FlutedGlass softness={0} highlight={1} lightAngle={45} angle={-45} frequency={15} edges="transparent">
              <Blob colorA="#FF0000" colorB="#FF0000" softness={0.2} highlightIntensity={0} speed={0.35} deformation={0.35}/>
            </FlutedGlass>
          </Shader>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full flex flex-col items-center justify-center text-center py-20 px-4 backdrop-blur-xs">
        <h1 className="text-5xl text-(--text-primary) mb-3">DevLink</h1>
        <h2 className="text-xl text-(--text-secondary) max-w-lg mb-8">
          Transformando ideias e projetos em especificações técnicas de alta qualidade.
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <ULIB.button onClick={() => redirect("/questionaire")}>Crie seu primeiro projeto</ULIB.button>
          <ULIB.button tone="secondary" onClick={handleScrollToVantagens}>
            Saiba mais <ArrowDown size={16} className="inline ml-1" />
          </ULIB.button>
        </div>
      </div>

      {/* Vantagens Section */}
      <div id="vantagens" className="w-full mx-auto max-w-6xl px-4 py-16 flex flex-col gap-6">
        <div>
          <span className="text-xs px-2.5 py-1 bg-(--surface-2) text-(--text-primary)">Vantagens</span>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-(--text-primary)">Quais são as vantagens ao utilizar a nossa plataforma?</h2>
          <p className="text-sm text-(--text-secondary) max-w-2xl">
            DevLink é uma plataforma que conecta clientes que têm visão de projetos com
            programadores capazes de transformar ideias em software real com agilidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-w-7xl">
          <div className="border border-(--border) p-5 flex flex-col gap-2">
            <h3 className="text-(--text-primary)">Exposição a programadores qualificados</h3>
            <p className="text-sm text-(--text-secondary)">
              Quanto maior a visibilidade do seu projeto para desenvolvedores ativos, mais rápido você encontra o parceiro ideal.
            </p>
          </div>

          <div className="border border-(--border) p-5 flex flex-col gap-2">
            <h3 className="text-(--text-primary)">Organização de tarefas e entregáveis</h3>
            <p className="text-sm text-(--text-secondary)">
              Cada projeto conta com quadro Kanban e listas de tarefas rápidas para acompanhar o progresso em tempo real.
            </p>
          </div>

          <div className="border border-(--border) p-5 flex flex-col gap-2">
            <h3 className="text-(--text-primary)">Comunicação em tempo real</h3>
            <p className="text-sm text-(--text-secondary)">
              Troque mensagens e propostas diretamente pela plataforma com atualizações instantâneas via eventos de streaming.
            </p>
          </div>

          <div className="border border-(--border) p-5 flex flex-col gap-2">
            <h3 className="text-(--text-primary)">Facilidade de encontrar novas oportunidades</h3>
            <p className="text-sm text-(--text-secondary)">
              Seu próximo projeto ou cliente está a apenas alguns cliques de distância com filtros avançados de busca.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="w-full px-10 py-16 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs max-w-max px-2.5 py-1 bg-(--surface-2) text-(--text-primary)">Funcionalidades</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
          <div className="border border-(--border) p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-(--primary)/10 text-(--primary) flex items-center justify-center">
              <PlusCircle size={20} />
            </div>
            <h3 className="text-(--text-primary)">Criação Guiada de Projetos</h3>
            <p className="text-sm text-(--text-secondary)">
              Questionário passo a passo estruturado para detalhar problema, público-alvo, plataformas e orçamento.
            </p>
          </div>

          <div className="border border-(--border) p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-(--primary)/10 text-(--primary) flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-(--text-primary)">Chat e Mensagens em Tempo Real</h3>
            <p className="text-sm text-(--text-secondary)">
              Envio e recebimento de propostas de serviço e negociação direta entre clientes e freelancers.
            </p>
          </div>

          <div className="border border-(--border) p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-(--primary)/10 text-(--primary) flex items-center justify-center">
              <PlusCircle size={20} />
            </div>
            <h3 className="text-(--text-primary)">Gestão de Tarefas Integrada</h3>
            <p className="text-sm text-(--text-secondary)">
              Tickets técnicos e to-dos rápidos diretamente vinculados a cada projeto contratado.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
