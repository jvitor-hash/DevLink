import { ULIB } from "../shared/ui";

export default function ErrorPage({ error }) {
    return (
        <>
            <div className="flex min-h-screen flex-col justify-center items-center text-center">
                <div className="flex max-w-2xl flex-col  items-center gap-5">
                    <h1 className="text-7xl text-(--text-primary)">DevLink</h1>
                    <h2 className="text-4xl text-(--text-primary) sm:text-5xl">Algo deu errado.</h2>
                    <p className="text-sm font-bold uppercase tracking-[0.35em] text-(--error)">{error}</p>
                    <p className="text-lg text-(--text-muted)">
                        Não conseguimos carregar esta página agora, mas você pode tentar novamente ou voltar para o início.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mt-5">
                    <ULIB.button tone="secondary">Contatar suporte</ULIB.button>
                    <ULIB.button>Voltar para o início</ULIB.button>
                </div>
            </div>
        </>
    );
}