precision mediump float;

uniform float width;

varying vec2 vertexPosition;
varying float pointOpacity;
varying vec3 rgbColor;

const float smoothing = 1.05;

void main () {
  float r = dot(vertexPosition, vertexPosition);
  float opacity = smoothstep(r, r * smoothing, 1.0);
  float stroke = smoothstep(width, width * smoothing, r);
  gl_FragColor = vec4(rgbColor, opacity * stroke * pointOpacity);
}