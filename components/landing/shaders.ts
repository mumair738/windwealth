export const fragmentShader = `precision highp float;

uniform float colorNum;
uniform float pixelSize;
uniform vec2 resolution;

const mat2x2 bayerMatrix2x2 = mat2x2(
    0.0, 2.0,
    3.0, 1.0
) / 4.0;

const mat4x4 bayerMatrix4x4 = mat4x4(
    0.0,  8.0,  2.0, 10.0,
    12.0, 4.0,  14.0, 6.0,
    3.0,  11.0, 1.0, 9.0,
    15.0, 7.0,  13.0, 5.0
) / 16.0;

const float bayerMatrix8x8[64] = float[64](
    0.0/ 64.0, 48.0/ 64.0, 12.0/ 64.0, 60.0/ 64.0,  3.0/ 64.0, 51.0/ 64.0, 15.0/ 64.0, 63.0/ 64.0,
  32.0/ 64.0, 16.0/ 64.0, 44.0/ 64.0, 28.0/ 64.0, 35.0/ 64.0, 19.0/ 64.0, 47.0/ 64.0, 31.0/ 64.0,
    8.0/ 64.0, 56.0/ 64.0,  4.0/ 64.0, 52.0/ 64.0, 11.0/ 64.0, 59.0/ 64.0,  7.0/ 64.0, 55.0/ 64.0,
  40.0/ 64.0, 24.0/ 64.0, 36.0/ 64.0, 20.0/ 64.0, 43.0/ 64.0, 27.0/ 64.0, 39.0/ 64.0, 23.0/ 64.0,
    2.0/ 64.0, 50.0/ 64.0, 14.0/ 64.0, 62.0/ 64.0,  1.0/ 64.0, 49.0/ 64.0, 13.0/ 64.0, 61.0/ 64.0,
  34.0/ 64.0, 18.0/ 64.0, 46.0/ 64.0, 30.0/ 64.0, 33.0/ 64.0, 17.0/ 64.0, 45.0/ 64.0, 29.0/ 64.0,
  10.0/ 64.0, 58.0/ 64.0,  6.0/ 64.0, 54.0/ 64.0,  9.0/ 64.0, 57.0/ 64.0,  5.0/ 64.0, 53.0/ 64.0,
  42.0/ 64.0, 26.0/ 64.0, 38.0/ 64.0, 22.0/ 64.0, 41.0/ 64.0, 25.0/ 64.0, 37.0/ 64.0, 21.0 / 64.0
);

vec3 dither(vec2 uv, vec3 color) {
  // Use normalized UV coordinates with fixed scale for consistent dithering
  // Scale UV to get consistent pattern density regardless of screen size
  float ditherScale = 1920.0; // Reference scale for consistent pattern
  vec2 ditherCoord = uv * ditherScale;
  int x = int(mod(ditherCoord.x, 8.0));
  int y = int(mod(ditherCoord.y, 8.0));
  
  // Get Bayer threshold (0-1 range)
  float bayerValue = bayerMatrix8x8[y * 8 + x];
  // Very subtle dithering - minimal threshold for performance (no expensive quantization)
  float threshold = (bayerValue - 0.5) * 0.02; // Minimal dithering effect

  // Apply very subtle dithering threshold only
  color.rgb += threshold;
  
  return color;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;  
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec4 color = texture2D(inputBuffer, uvPixel);
  color.rgb = dither(uvPixel, color.rgb);

  outputColor = color;
}`;

export const waveFragmentShader = `precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float colorNum;
uniform float pixelSize;
uniform vec2 mouse;

varying vec2 vUv;

// Bayer dithering matrix
const float bayerMatrix8x8[64] = float[64](
    0.0/ 64.0, 48.0/ 64.0, 12.0/ 64.0, 60.0/ 64.0,  3.0/ 64.0, 51.0/ 64.0, 15.0/ 64.0, 63.0/ 64.0,
  32.0/ 64.0, 16.0/ 64.0, 44.0/ 64.0, 28.0/ 64.0, 35.0/ 64.0, 19.0/ 64.0, 47.0/ 64.0, 31.0/ 64.0,
    8.0/ 64.0, 56.0/ 64.0,  4.0/ 64.0, 52.0/ 64.0, 11.0/ 64.0, 59.0/ 64.0,  7.0/ 64.0, 55.0/ 64.0,
  40.0/ 64.0, 24.0/ 64.0, 36.0/ 64.0, 20.0/ 64.0, 43.0/ 64.0, 27.0/ 64.0, 39.0/ 64.0, 23.0/ 64.0,
    2.0/ 64.0, 50.0/ 64.0, 14.0/ 64.0, 62.0/ 64.0,  1.0/ 64.0, 49.0/ 64.0, 13.0/ 64.0, 61.0/ 64.0,
  34.0/ 64.0, 18.0/ 64.0, 46.0/ 64.0, 30.0/ 64.0, 33.0/ 64.0, 17.0/ 64.0, 45.0/ 64.0, 29.0/ 64.0,
  10.0/ 64.0, 58.0/ 64.0,  6.0/ 64.0, 54.0/ 64.0,  9.0/ 64.0, 57.0/ 64.0,  5.0/ 64.0, 53.0/ 64.0,
  42.0/ 64.0, 26.0/ 64.0, 38.0/ 64.0, 22.0/ 64.0, 41.0/ 64.0, 25.0/ 64.0, 37.0/ 64.0, 21.0 / 64.0
);

vec3 dither(vec2 uv, vec3 color) {
  // Use normalized UV coordinates with fixed scale for consistent dithering
  // Scale UV to get consistent pattern density regardless of screen size
  float ditherScale = 1920.0; // Reference scale for consistent pattern
  vec2 ditherCoord = uv * ditherScale;
  int x = int(mod(ditherCoord.x, 8.0));
  int y = int(mod(ditherCoord.y, 8.0));
  
  // Get Bayer threshold (0-1 range)
  float bayerValue = bayerMatrix8x8[y * 8 + x];
  // Very subtle dithering - minimal threshold for performance (no expensive quantization)
  float threshold = (bayerValue - 0.5) * 0.02; // Minimal dithering effect

  // Apply very subtle dithering threshold only
  color.rgb += threshold;
  
  return color;
}

vec4 mod289(vec4 x) {
 return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
 return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;

    vec4 i = permute(permute(ix) + iy);

    vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    vec4 gy = abs(gx) - 0.5 ;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;

    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);

    vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));

    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

const int OCTAVES = 3;

float fbm(vec2 p) {
    // Initial values
    float value = -0.2;
    float amplitude = 1.0;
    float frequency = 2.5;
    // Reduced to 3 octaves for better performance
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * abs(cnoise(p));
        p *= frequency;
        amplitude *= 0.35;
    }
    return value;
}

float pattern(vec2 p) {  
    // Mouse interaction - create flow effect
    vec2 mouseOffset = (mouse - 0.5) * 2.0; // Convert to -1 to 1 range
    // Simplified: single fbm call with offset instead of triple-nested calls
    // This reduces computation from 12 octaves to 3 octaves per pixel
    vec2 p2 = p - time * 0.05 + mouseOffset * 0.3;
    return fbm(p2);
}

void main() {

  vec2 uv = vUv;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;

  vec3 col = vec3(0.0);

  float f = pattern(uv);
  
  // Design system colors - black-ish with purple accents
  vec3 purple = vec3(0.318, 0.408, 1.0); // #5168FF (primary purple)
  vec3 darkBase = vec3(0.05, 0.05, 0.08); // Very dark, slightly blue-tinted black
  vec3 darkMid = vec3(0.08, 0.08, 0.12); // Slightly lighter dark
  vec3 purpleDark = vec3(0.15, 0.18, 0.35); // Dark purple
  
  // Create a gradient from dark to purple based on noise pattern
  float purpleAmount = smoothstep(0.2, 0.8, f);
  float gradientMix = smoothstep(0.0, 1.0, f);
  
  // Mix dark gradient colors first
  vec3 gradientColor = mix(darkBase, darkMid, gradientMix);
  
  // Then mix in purple accents - more prominent purple in the pattern
  col = mix(gradientColor, purpleDark, purpleAmount * 0.6);
  
  // Add purple highlights where pattern is strongest
  float purpleHighlight = smoothstep(0.5, 0.85, f);
  col = mix(col, purple, purpleHighlight * 0.3);
  
  // Keep it dark but with subtle brightness variation
  col = mix(col, col * 1.2, 0.2);

  // Apply Bayer dithering using normalized UV coordinates
  // This ensures consistent pattern across all screen sizes
  col = dither(vUv, col);

  gl_FragColor = vec4(col, 1.0);
}`;

export const waveVertexShader = `precision highp float;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}`;

