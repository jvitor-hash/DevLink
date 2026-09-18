import Button from "@/components/ui/button_component";
import WaveEffect from "@/components/ui/wave_shader_component";
import { CategoryCards } from "./category_cards";

export default function Home() {
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

        <div className="mx-8">
          <CategoryCards />
        </div>
      </section>

      <section className="w-full min-h-screen">
        <p className="text-3xl text-center w-full mb-2">Quem nos somos</p>
        <p className="text-lg text-(--text-muted) w-full text-center mb-3">Esta e a nossa equipe de desenvolvedores que ajudaram nesse projeto</p>
      </section>
    </main>
  );
}
