import { useEffect, useState } from "react";
import ShaderCanvas from "@/components/ui/shader_component";
import { WATER_DITHER_SHADER } from "@/assets/dither_water";

export default function WaveEffect() {
  const [resolution, setResolution] = useState<[number, number]>([1, 1]);

  // Set/update resolution
  useEffect(() => {
    const updateResolution = () => {
      const dpr = window.devicePixelRatio || 1;

      setResolution([window.innerWidth * dpr, window.innerHeight * dpr]);
    };

    updateResolution();
    window.addEventListener("resize", updateResolution);

    return () => {
      window.removeEventListener("resize", updateResolution);
    };
  }, []);

  return (
    <div>
      <ShaderCanvas
        fragmentShader={WATER_DITHER_SHADER}
        uniforms={{ u_resolution: resolution }}
        className="absolute w-full h-full top-0 left-0 -z-1 mix-blend-luminosity opacity-50
        mask-[linear-gradient(to_bottom,white_35%,transparent_100%)]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      />
    </div>
  );
}
