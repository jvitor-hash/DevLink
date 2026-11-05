export default function HowItWorksCard() {
    return (
        <>
            <div className="mx-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-6">
                    <div className="mb-4 flex items-baseline gap-3">
                        <h6 className="text-3xl text-(--primary)">01</h6>
                        <h3 className="text-xl">Descreva a ideia</h3>
                    </div>
                    <div className="border border-(--border) my-4" />
                    <p className="text-sm">Responda o questionário guiado sobre problema e público.</p>
                </div>

                <div className="p-6">
                    <div className="mb-4 flex items-baseline gap-3">
                        <h6 className="text-3xl text-(--primary)">02</h6>
                        <h3 className="text-xl">Publique o projeto</h3>
                    </div>
                    <div className="border border-(--border) my-4" />
                    <p className="text-sm">A especificação vira um projeto visível para desenvolvedores.</p>
                </div>

                <div className="p-6">
                    <div className="mb-4 flex items-baseline gap-3">
                        <h6 className="text-3xl text-(--primary)">03</h6>
                        <h3 className="text-xl">Receba propostas</h3>
                    </div>
                    <div className="border border-(--border) my-4" />
                    <p className="text-sm">Negocie prazo e orçamento pelo chat do projeto.</p>
                </div>
            </div>
        </>
    )
}