// Fragment shader: layered sine ripples driven by "impulses" (ripple origins
// with birth time and strength), rendered through an 8x8 Bayer dither into
// pure black & white.

export const WATER_DITHER_SHADER: string = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;

  #define MAX_RIPPLES 24
  uniform vec2 u_ripplePos[MAX_RIPPLES];
  uniform float u_rippleTime[MAX_RIPPLES];
  uniform float u_rippleStrength[MAX_RIPPLES];
  uniform int u_rippleCount;

  // 8x8 Bayer ordered dithering matrix.
  // GLSL ES 1.00-compatible: no array constructors.
  float bayer8x8(vec2 pos) {
    int x = int(mod(pos.x, 8.0));
    int y = int(mod(pos.y, 8.0));
    int index = y * 8 + x;

    if (index == 0)  return  0.0 / 64.0;
    if (index == 1)  return 32.0 / 64.0;
    if (index == 2)  return  8.0 / 64.0;
    if (index == 3)  return 40.0 / 64.0;
    if (index == 4)  return  2.0 / 64.0;
    if (index == 5)  return 34.0 / 64.0;
    if (index == 6)  return 10.0 / 64.0;
    if (index == 7)  return 42.0 / 64.0;

    if (index == 8)  return 48.0 / 64.0;
    if (index == 9)  return 16.0 / 64.0;
    if (index == 10) return 56.0 / 64.0;
    if (index == 11) return 24.0 / 64.0;
    if (index == 12) return 50.0 / 64.0;
    if (index == 13) return 18.0 / 64.0;
    if (index == 14) return 58.0 / 64.0;
    if (index == 15) return 26.0 / 64.0;

    if (index == 16) return 12.0 / 64.0;
    if (index == 17) return 44.0 / 64.0;
    if (index == 18) return  4.0 / 64.0;
    if (index == 19) return 36.0 / 64.0;
    if (index == 20) return 14.0 / 64.0;
    if (index == 21) return 46.0 / 64.0;
    if (index == 22) return  6.0 / 64.0;
    if (index == 23) return 38.0 / 64.0;

    if (index == 24) return 60.0 / 64.0;
    if (index == 25) return 28.0 / 64.0;
    if (index == 26) return 52.0 / 64.0;
    if (index == 27) return 20.0 / 64.0;
    if (index == 28) return 62.0 / 64.0;
    if (index == 29) return 30.0 / 64.0;
    if (index == 30) return 54.0 / 64.0;
    if (index == 31) return 22.0 / 64.0;

    if (index == 32) return  3.0 / 64.0;
    if (index == 33) return 35.0 / 64.0;
    if (index == 34) return 11.0 / 64.0;
    if (index == 35) return 43.0 / 64.0;
    if (index == 36) return  1.0 / 64.0;
    if (index == 37) return 33.0 / 64.0;
    if (index == 38) return  9.0 / 64.0;
    if (index == 39) return 41.0 / 64.0;

    if (index == 40) return 51.0 / 64.0;
    if (index == 41) return 19.0 / 64.0;
    if (index == 42) return 59.0 / 64.0;
    if (index == 43) return 27.0 / 64.0;
    if (index == 44) return 49.0 / 64.0;
    if (index == 45) return 17.0 / 64.0;
    if (index == 46) return 57.0 / 64.0;
    if (index == 47) return 25.0 / 64.0;

    if (index == 48) return 15.0 / 64.0;
    if (index == 49) return 47.0 / 64.0;
    if (index == 50) return  7.0 / 64.0;
    if (index == 51) return 39.0 / 64.0;
    if (index == 52) return 13.0 / 64.0;
    if (index == 53) return 45.0 / 64.0;
    if (index == 54) return  5.0 / 64.0;
    if (index == 55) return 37.0 / 64.0;

    if (index == 56) return 63.0 / 64.0;
    if (index == 57) return 31.0 / 64.0;
    if (index == 58) return 55.0 / 64.0;
    if (index == 59) return 23.0 / 64.0;
    if (index == 60) return 61.0 / 64.0;
    if (index == 61) return 29.0 / 64.0;
    if (index == 62) return 53.0 / 64.0;
    if (index == 63) return 21.0 / 64.0;

    return 0.0;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 pos = gl_FragCoord.xy;

    float aspect = u_resolution.x / u_resolution.y;
    vec2 uvAspect = vec2(uv.x * aspect, uv.y);

    // Base subtle ambient field.
    float field =
      0.08 * sin((uvAspect.x + uvAspect.y) * 6.0 + u_time * 0.15);

    // Accumulate ripple contributions.
    for (int i = 0; i < MAX_RIPPLES; i++) {
      if (i >= u_rippleCount) break;

      vec2 rp = vec2(
        u_ripplePos[i].x * aspect,
        u_ripplePos[i].y
      );

      float age = u_time - u_rippleTime[i];

      if (age < 0.0 || age > 4.0) continue;

      float dist = length(uvAspect - rp);

      float speed = 0.1;
      float wavefront = age * speed;
      float ringWidth = 0.25;

      float envelope =
        exp(-pow((dist - wavefront) / ringWidth, 2.0));

      float decay = exp(-age * 1.1);

      float wave =
        sin(dist * 28.0 - age * 9.0)
        * envelope
        * decay
        * u_rippleStrength[i];

      field += wave;
    }

    // Map field to grayscale intensity.
    float intensity = 0.1 + field * 0.7;
    intensity = clamp(intensity, 0.0, 1.0);

    // Ordered dithering.
    float threshold = bayer8x8(pos);
    float dithered = intensity > threshold ? 1.0 : 0.0;

    gl_FragColor = vec4(vec3(dithered), 1.0);
  }
`;
