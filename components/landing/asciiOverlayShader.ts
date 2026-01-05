export const asciiOverlayFragmentShader = `precision highp float;

uniform sampler2D uImageTexture;
uniform vec2 resolution;
uniform float asciicode;
uniform float asciiu;

// Barrel distortion - enhanced fisheye effect
vec2 barrelDistortion(vec2 uv, float strength) {
    vec2 center = vec2(0.5, 0.5);
    vec2 coord = uv - center;
    float dist = length(coord);
    
    // Enhanced barrel distortion formula for more realistic fisheye effect
    float distSquared = dist * dist;
    float distFourth = distSquared * distSquared;
    float factor = 1.0 + strength * distSquared + strength * 0.5 * distFourth;
    
    return center + coord * factor;
}

// Sample image and convert to ASCII circle pattern
float asciiPattern(vec2 screenUV, sampler2D imageTexture, float code) {
    // Apply barrel distortion to screen coordinates
    vec2 distortedUV = barrelDistortion(screenUV, 1.2);
    
    // Sample the source image at the distorted position
    vec4 imageColor = texture2D(imageTexture, distortedUV);
    float brightness = dot(imageColor.rgb, vec3(0.299, 0.587, 0.114)); // Luminance
    
    // Create grid for ASCII characters (using distorted UV for consistent distortion)
    vec2 grid = floor(distortedUV * code);
    vec2 cell = fract(distortedUV * code);
    
    // Create circle pattern based on brightness (large circles)
    vec2 center = vec2(0.5, 0.5);
    float dist = length(cell - center);
    
    // Larger circles for brighter areas, smaller for darker
    float circleThreshold = mix(0.15, 0.45, brightness);
    float pattern = step(dist, circleThreshold);
    
    return pattern;
}

void main() {
    // Get screen-space coordinates
    vec2 screenUV = gl_FragCoord.xy / resolution;
    
    // Create ASCII circle pattern from source image
    float asciiPatternValue = asciiPattern(screenUV, uImageTexture, asciicode);
    
    // Create mask - bright areas (circles) = visible, dark areas = transparent
    float mask = asciiPatternValue;
    
    // Discard pixels where mask is too low (dark areas)
    if (mask < 0.1) {
        discard;
    }
    
    // Output with alpha - cubes show through where ASCII pattern is
    float alpha = mask * asciiu;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}`;

export const asciiOverlayVertexShader = `precision highp float;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
