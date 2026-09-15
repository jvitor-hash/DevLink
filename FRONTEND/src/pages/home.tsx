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
        <div className="flex">
          <div className="flex flex-col gap-3 *:bg-(--error)/50 *:hover:cursor-pointer *:max-w-xs *:p-10 *:mx-5 *:hover:bg-(--primary) *:transition-colors *:duration-300">
            <button
              type="button"
              onMouseEnter={() => handleCategories("Websites")}
              onMouseLeave={() => {
                if (!isHoveringSubmenu) {
                  setActiveCategory(null);
                }
              }}
            >
              <div className="flex justify-between items-baseline">
                Websites
                <ChevronRight className="inline" size={18} />
              </div>
            </button>

            <button
              type="button"
              onMouseEnter={() => handleCategories("Desenvolvimento de Apps")}
              onMouseLeave={() => {
                if (!isHoveringSubmenu) {
                  setActiveCategory(null);
                }
              }}
            >
              <div className="flex justify-between items-baseline">
                Desenvolvimento de Apps
                <ChevronRight className="inline" size={18} />
              </div>
            </button>

            <button
              type="button"
              onMouseEnter={() => handleCategories("Plataforma Mobile")}
              onMouseLeave={() => {
                if (!isHoveringSubmenu) {
                  setActiveCategory(null);
                }
              }}
            >
              <div className="flex justify-between items-baseline">
                Plataforma Mobile
                <ChevronRight className="inline" size={18} />
              </div>
            </button>

            <button
              type="button"
              onMouseEnter={() => handleCategories("Suporte e Cibersegurança")}
              onMouseLeave={() => {
                if (!isHoveringSubmenu) {
                  setActiveCategory(null);
                }
              }}
            >
              <div className="flex justify-between items-baseline">
                Suporte e Cibersegurança
                <ChevronRight className="inline" size={18} />
              </div>
            </button>

            <button
              type="button"
              onMouseEnter={() => handleCategories("Blockchain & Web3")}
              onMouseLeave={() => {
                if (!isHoveringSubmenu) {
                  setActiveCategory(null);
                }
              }}
            >
              <div className="flex justify-between items-baseline">
                Blockchain & Web3
                <ChevronRight className="inline" size={18} />
              </div>
            </button>
          </div>
          {activeCategory !== null && (
            <div
              ref={submenuRef}
              className="flex flex-col bg-(--error)/50 text-white p-4 gap-10 overflow-hidden transition-all duration-300 ease-out"
              style={{
                maxHeight: targetHeight > 0 ? targetHeight.toString() : "0px",
              }}

              onMouseEnter={() => setIsHoveringSubmenu(true)}
              onMouseLeave={() => {
                setIsHoveringSubmenu(false);
                setActiveCategory(null);
              }}
            >
              {categories[activeCategory]!.map((subCategory) => (
                <Link
                  key={subCategory}
                  to={`/project?category=${encodeURIComponent("test")}&sub_category=${encodeURIComponent(subCategory)}`}
                >
                  {subCategory}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
