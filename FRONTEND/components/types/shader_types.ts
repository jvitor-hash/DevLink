import { CSSProperties, PointerEvent } from 'react';

export type UniformValue =
    | number
    | [number]
    | [number, number]
    | [number, number, number]
    | [number, number, number, number];

export interface UniformsMap {
  [uniformName: string]: UniformValue;
}

export interface ShaderCanvasProps {
    /**
     * GLSL Fragment Shader source code.
     */
    fragmentShader: string;

    /**
     * Optional custom Vertex Shader source code.
     * Defaults to a standard full-screen quad shader.
     */
    vertexShader?: string;

    /**
     * Dictionary of custom uniforms passed to the shader.
     * Automatically updating without re-compiling the WebGL program.
     */
    uniforms?: UniformsMap;

    /**
     * Pointer move event handler attached to the canvas element.
     */
    onPointerMove?: (event: PointerEvent<HTMLCanvasElement>) => void;

    /**
     * Inline CSS styles for the HTML `<canvas>` element.
     */
    style?: CSSProperties;

    /**
     * Utility classes (e.g. Tailwind CSS).
     */
    className?: string;
}