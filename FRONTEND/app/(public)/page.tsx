import Button from "@/components/ui/button_component";
import WaveEffect from "@/components/ui/wave_shader_component";
import LinkList from "@/components/ui/links_list_component";
import Link from "next/link";

export default function Home() {


  return (
    <main>
      <section className="w-full min-h-screen overflow-hidden">
        <WaveEffect/>
        <div className="relative top-35 left-25 max-w-fit max-h-fit">
          <h1 className="text-6xl mb-5">Transforme suas ideias em <br/>especificações técnicas.</h1>
          <p className="text-lg mb-5 text-(--text-muted)">Tire suas ideias do papel e transforme-as em planos técnicos objetivos.</p>
          <div className="flex justify-between max-w-sm">
            <Button label="Questionário" colorType="primary" buttonType="button"/>
            <Button label="Como funciona?" colorType="secondary" buttonType="button"/>
          </div>
        </div>
      </section>

      <section className="w-full min-h-screen">
        <p className="text-3xl text-center w-full mb-2">Categorias</p>
        <p className="text-lg text-(--text-muted) w-full text-center mb-3">Pesquise por categoria e encontre o projeto que procura.</p>
        <LinkList>
          <Link href="/">Websites</Link>
          <Link href="/">Desenvolvimento de Apps</Link>
          <Link href="/">Plataforma Mobile</Link>
          <Link href="/">Suporte e Cibersegurança</Link>
          <Link href="/">Blockchain & Web3</Link>
        </LinkList>
      </section>
    </main>
  );
}
