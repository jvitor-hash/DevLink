import { FlutedGlass, Blob, Shader } from "shaders/react";
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
                    <ULIB.button>Responda este questionario</ULIB.button>
                    <ULIB.button>Saiba mais</ULIB.button>
                </div>
            </div>

            <div>
                <div className="border border-(--border) p-4">
                    <p>Vantagens</p>
                </div>

                <div className="text-right">
                    <h2>Quais seriam as vantagens ao utilizar o nosso servico?</h2>
                    <p>DevLink e uma plataforma de freelance que conecta clientes com ideias de projetos com programadores com a abilidade tecnica para transformar suas ideias em realidade</p>
                </div>
            </div>
        </>
    );
}