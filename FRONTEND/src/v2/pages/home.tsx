import { FlutedGlass, Blob, Shader } from "shaders/react";
import { MessageCircle, PlusCircle } from "react-feather";
import { ULIB } from "@/shared/ui";

export default function HomePage() {
    return (
        <>
            <div className="absolute inset-0">
                <div className="absolute w-full h-full top-0 left-0 z-[-1] opacity-50">
                    <Shader >
                        <FlutedGlass softness={0} highlight={1} lightAngle={45} angle={-45} frequency={15} edges="transparent">
                        <Blob colorA="#FF0000" colorB="#FF0000" softness={0.2} highlightIntensity={0} speed={0.35} deformation={0.35} />
                        </FlutedGlass>
                    </Shader>
                </div>
            </div>

            <div className="w-full flex flex-col items-center backdrop-blur-sm">
                <h3>DevLink</h3>
                <h5>Transformando projetos em realidade</h5>
                <div className="flex gap-2">
                    <ULIB.button>Crie seu primeiro projeto</ULIB.button>
                    <ULIB.button>Saiba mais</ULIB.button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="border border-(--border) p-4">
                    <p>Vantagens</p>
                </div>

                <div className="text-right">
                    <h2>Quais seriam as vantagens ao utilizar o nosso servico?</h2>
                    <p>DevLink e uma plataforma de freelance que conecta clientes com ideias de projetos com programadores com a abilidade tecnica para transformar suas ideias em realidade</p>
                </div>

                <div className="grid grid-cols-2 grid-rows-2 items-right">
                    <div className="border border-(--border) p-2">
                        <h5>Exposição a programadores</h5>
                        <p>Quando a maior quantidade de olhos em seu projeto mais fácil será tornar seu projeto em realidade.</p>
                    </div>
                    
                    <div className="border border-(--border) p-2">
                        <h5>Organização de tarefas de projetos</h5>
                        <p>Cada projeto seu pode ser organizado de acordo com suas necessidades além de servir como uma ferramenta de colaboração.</p>
                    </div>

                    <div className="border border-(--border) p-2">
                        <h5>Comunicação em tempo real</h5>
                        <p>Sempre esteja em constante comunicação entre os membros associados a seus projetos.</p>
                    </div>

                    <div className="border border-(--border) p-2">
                        <h5>Facilidade de encontrar novos projetos</h5>
                        <p>Seu proximo cliente com projetos esta a poucos cliques de distância.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="border border-(--border) p-2">
                    <p>Features</p>
                </div> 

                <div className="flex gap-2 items-center">
                    <div>
                        <div className="bg-(--surface-1) rounded-sm">
                            <PlusCircle size={18}/>
                        </div>
                            
                        <h5>Sistema de criação e gerenciamtento de projetos</h5>
                        <p>Projetos podem ser organizados baseado em suas necessidades</p>
                    </div>

                    <div>
                        <div className="bg-(--surface-1) rounded-sm"></div>
                        <h5>Features - 2</h5>
                        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex, vel.</p>
                    </div>

                    <div>
                        <div className="bg-(--surface-1) rounded-sm">
                            <MessageCircle size={18}/>
                        </div>
                        <h5>Comunicação em tempo real</h5>
                        <p>Messagens podem ser enviadas diretamente para clientes dos projetos</p>
                    </div>
                </div>
            </div>
        </>
    );
}