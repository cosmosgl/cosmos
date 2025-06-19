#ifdef GL_ES
precision highp float;
#endif

attribute vec2 pointIndices;
attribute float size;
attribute vec4 color;

uniform sampler2D positionsTexture;
uniform sampler2D pointGreyoutStatus;
uniform float ratio;
uniform mat3 transformationMatrix;
uniform float pointsTextureSize;
uniform float sizeScale;
uniform float spaceSize;
uniform vec2 screenSize;
uniform float greyoutOpacity;
uniform float pointOpacity;
uniform vec4 greyoutColor;
uniform vec4 backgroundColor;
uniform bool scalePointsOnZoom;
uniform float maxPointSize;
uniform bool darkenGreyout;
uniform bool renderOnlySelected;
uniform bool renderOnlyUnselected;

varying vec2 textureCoords;
varying vec3 rgbColor;
varying float alpha;

float calculatePointSize(float size) {
  float pSize;
  if (scalePointsOnZoom) { 
    pSize = size * ratio * transformationMatrix[0][0];
  } else {
    pSize = size * ratio * min(5.0, max(1.0, transformationMatrix[0][0] * 0.01));
  }

  return min(pSize, maxPointSize * ratio);
}

void main() {  
  textureCoords = pointIndices;
  
  // Check greyout status for selective rendering
  vec4 greyoutStatus = texture2D(pointGreyoutStatus, (textureCoords + 0.5) / pointsTextureSize);
  bool isSelected = greyoutStatus.r == 0.0;
  
  // Discard point based on rendering mode
  if (renderOnlySelected && !isSelected) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Move off-screen
    gl_PointSize = 0.0;
    return;
  }
  if (renderOnlyUnselected && isSelected) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Move off-screen
    gl_PointSize = 0.0;
    return;
  }
  
  // Position
  vec4 pointPosition = texture2D(positionsTexture, (textureCoords + 0.5) / pointsTextureSize);
  vec2 point = pointPosition.rg;

  // Transform point position to normalized device coordinates
  vec2 normalizedPosition = 2.0 * point / spaceSize - 1.0;
  normalizedPosition *= spaceSize / screenSize;
  vec3 finalPosition = transformationMatrix * vec3(normalizedPosition, 1);
  gl_Position = vec4(finalPosition.rg, 0, 1);

  gl_PointSize = calculatePointSize(size * sizeScale);

  rgbColor = color.rgb;
  alpha = color.a * pointOpacity;

  // Adjust alpha of selected points
  if (greyoutStatus.r > 0.0) {
    if (greyoutColor[0] != -1.0) {
      rgbColor = greyoutColor.rgb;
      alpha = greyoutColor.a;
    } else {
      // If greyoutColor is not set, make color lighter or darker based on darkenGreyout
      float blendFactor = 0.65; // Controls how much to modify (0.0 = original, 1.0 = target color)
      
      if (darkenGreyout) {
        // Darken the color
        rgbColor = mix(rgbColor, vec3(0.2), blendFactor);
      } else {
        // Lighten the color
        rgbColor = mix(rgbColor, max(backgroundColor.rgb, vec3(0.8)), blendFactor);
      }
    }

    if (greyoutOpacity != -1.0) {
      alpha *= greyoutOpacity;
    }
  }
}
