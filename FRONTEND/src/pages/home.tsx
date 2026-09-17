import { useState, useRef, useEffect } from 'react';
import Button from "@/components/ui/button_component";
import WaveEffect from "@/components/ui/wave_shader_component";
import { ChevronRight } from "react-feather";
import { Link } from "react-router-dom";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isHoveringSubmenu, setIsHoveringSubmenu] = useState(false);

  const submenuRef = useRef<HTMLDivElement>(null);
  const [targetHeight, setTargetHeight] = useState<number>(0);

  const categories: Record<string, string[]> = {
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

  useEffect(() => {
    if (activeCategory !== null) {
      // Wait for the DOM to be fully laid out
      const timer = setTimeout(() => {
        if (submenuRef.current) {
          const height = submenuRef.current.scrollHeight;
          if (height > 0) {
            setTargetHeight(height);
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeCategory]);

  const handleCategories = (category: string | null) => {
    if (category !== null) {
      setActiveCategory(category);
    } else {
      setTargetHeight(0);
      setActiveCategory(null);
    }
  };


  return (
    <main>
      <section className="w-full min-h-screen overflow-hidden">
        <WaveEffect />
        <div className="relative top-35 left-25 max-w-fit max-h-fit">
          <h1 className="text-6xl mb-5">Transforme suas ideias em <br />especificações técnicas.</h1>
          <p className="text-lg mb-5 text-(--text-muted)">Tire suas ideias do papel e transforme-as em planos técnicos objetivos.</p>
          <div className="flex justify-between max-w-sm">
            <Button label="Questionário" colorType="primary" buttonType="button" href='/questionnaire' />
            <Button label="Como funciona?" colorType="secondary" buttonType="button" />
          </div>
        </div>
      </section>

      <section className="w-full min-h-screen">
        <p className="text-3xl text-center w-full mb-2">Categorias</p>
        <p className="text-lg text-(--text-muted) w-full text-center mb-3">Pesquise por categoria e encontre o projeto que procura.</p>
        {/*TODO: Make cards for each category and sub-category when the clicks on the sub-category
          or category it would redirect them to the projects page and apply the filter*/}
      </section>

      <section className="w-full min-h-screen">
        <p className="text-3xl text-center w-full mb-2">Quem nos somos</p>
        <p className="text-lg text-(--text-muted) w-full text-center mb-3">Esta e a nossa equipe de desenvolvedores que ajudaram nesse projeto</p>
      </section>
    </main>
  );
}
