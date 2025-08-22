precision mediump float;

attribute vec2 vertexCoord;

uniform sampler2D positionsTexture;
uniform sampler2D pointGreyoutStatusTexture;
uniform float size;
uniform mat3 transformationMatrix;
uniform float pointsTextureSize;
uniform float sizeScale;
uniform float spaceSize;
uniform vec2 screenSize;
uniform bool scalePointsOnZoom;
uniform float pointIndex;
uniform float maxPointSize;
uniform vec4 color;
uniform float universalPointOpacity;
uniform float greyoutOpacity;
uniform bool isDarkenGreyout;
uniform vec4 backgroundColor;
uniform vec4 greyoutColor;
varying vec2 vertexPosition;
varying float pointOpacity;
varying vec3 rgbColor;

float calculatePointSize(float size) {
  float pSize;
  if (scalePointsOnZoom) { 
    pSize = size * transformationMatrix[0][0];
  } else {
    pSize = size * min(5.0, max(1.0, transformationMatrix[0][0] * 0.01));
  }
  return min(pSize, maxPointSize);
}

const float relativeRingRadius = 1.3;

void main () {
  vertexPosition = vertexCoord;

  vec2 textureCoordinates = vec2(mod(pointIndex, pointsTextureSize), floor(pointIndex / pointsTextureSize)) + 0.5;
  vec4 pointPosition = texture2D(positionsTexture, textureCoordinates / pointsTextureSize);

  rgbColor = color.rgb;
  pointOpacity = color.a * universalPointOpacity;
  vec4 greyoutStatus = texture2D(pointGreyoutStatusTexture, textureCoordinates / pointsTextureSize);
  if (greyoutStatus.r > 0.0) {
    if (greyoutColor[0] != -1.0) {
      rgbColor = greyoutColor.rgb;
      pointOpacity = greyoutColor.a;
    } else {
      // If greyoutColor is not set, make color lighter or darker based on isDarkenGreyout
      float blendFactor = 0.65; // Controls how much to modify (0.0 = original, 1.0 = target color)
      
      if (isDarkenGreyout) {
        // Darken the color
        rgbColor = mix(rgbColor, vec3(0.2), blendFactor);
      } else {
        // Lighten the color
        rgbColor = mix(rgbColor, max(backgroundColor.rgb, vec3(0.8)), blendFactor);
      }
    }

    if (greyoutOpacity != -1.0) {
      pointOpacity *= greyoutOpacity;
    }
  }

  // Calculate point radius
  float pointSize = (calculatePointSize(size * sizeScale) * relativeRingRadius) / transformationMatrix[0][0];
  float radius = pointSize * 0.5;

  // Calculate point position in screen space
  vec2 a = pointPosition.xy;
  vec2 b = pointPosition.xy + vec2(0.0, radius);
  vec2 xBasis = b - a;
  vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
  vec2 pointPositionInScreenSpace = a + xBasis * vertexCoord.x + yBasis * radius * vertexCoord.y;

  // Transform point position to normalized device coordinates
  vec2 p = 2.0 * pointPositionInScreenSpace / spaceSize - 1.0;
  p *= spaceSize / screenSize;
  vec3 final =  transformationMatrix * vec3(p, 1);
  
  gl_Position = vec4(final.rg, 0, 1);
}