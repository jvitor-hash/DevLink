'use client';

import { useEffect, useRef } from 'react';
import type { ShaderCanvasProps } from '../types/shader_types';

const DEFAULT_VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export default function ShaderCanvas({fragmentShader, vertexShader = DEFAULT_VERTEX_SHADER, uniforms = {}, onPointerMove, style, className} : ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uniformsRef = useRef(uniforms);

  // Keep uniforms updated without triggering a WebGL context rebuild
  useEffect(() => {
    uniformsRef.current = uniforms;
  }, [uniforms]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Helper: Compile individual shaders
    const compileShader = (type: number, source: string) => {
      const shader: WebGLShader | null = gl.createShader(type);
      if (shader === null)
        throw new Error("Failed to create WebGL Shader");

      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = compileShader(gl.VERTEX_SHADER, vertexShader);
    const frag = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vert || !frag) return;

    // Link Program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Geometry Setup (Full-screen Quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Track uniform locations dynamically
    const uniformLocations: Record<string, WebGLUniformLocation | null> = {};
    const getUniformLoc = (name: string) => {
      if (!(name in uniformLocations)) {
        uniformLocations[name] = gl.getUniformLocation(program, name);
      }
      return uniformLocations[name];
    };

    let animationFrameId: number;

    // Resize Handler
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Render Loop
    const render = (time: number) => {
      const currentUniforms = uniformsRef.current;

      // Pass auto-injected uniforms if present in shader
      const uRes = getUniformLoc('u_resolution');
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);

      const uTime = getUniformLoc('u_time');
      if (uTime) gl.uniform1f(uTime, time * 0.001);

      // Dynamically parse custom uniform values
      Object.entries(currentUniforms).forEach(([name, val]) => {
        const loc = getUniformLoc(name);
        if (!loc) return;

        if (typeof val === 'number') {
          gl.uniform1f(loc, val);
        } else if (Array.isArray(val)) {
          switch (val.length) {
            case 1: gl.uniform1f(loc, val[0]); break;
            case 2: gl.uniform2f(loc, val[0], val[1]); break;
            case 3: gl.uniform3f(loc, val[0], val[1], val[2]); break;
            case 4: gl.uniform4f(loc, val[0], val[1], val[2], val[3]); break;
          }
        }
      });

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
    };
  }, [fragmentShader, vertexShader]);

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={onPointerMove}
      className={`${className}`}
      style={{
        ...style,
      }}
    />
  );
}
