import Button from "@/components/ui/button_component";

type ErrorPageProps = { error?: Error | null };

export default function ErrorPage({ error }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center text-center">
      <section className="flex max-w-2xl flex-col  items-center gap-5">
        <h1 className="text-7xl text-white">DevLink</h1>
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-(--error)">Error 500</p>
        <h2 className="text-4xl text-(--text-primary) sm:text-5xl">Algo deu errado.</h2>
        <p className="text-lg text-(--text-muted)">Não conseguimos carregar esta página agora, mas você pode tentar novamente ou voltar para o início.</p>
        {error && <p className="max-w-xl text-sm text-(--text-disabled)">{error.message}</p>}
      </section>

      <div className="flex flex-wrap justify-center gap-3 mt-5">
        <Button label="Contatar suporte" href="/" colorType="secondary" />
        <Button label="Voltar para o início" href="/" colorType="primary" />
      </div>
    </main>
  );
}
