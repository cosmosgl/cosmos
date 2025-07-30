#ifdef GL_ES
precision highp float;
#endif

attribute vec2 pointIndices;
attribute float size;
attribute vec4 color;
attribute float shape;
attribute float imageIndex;
attribute float imageSize;

uniform sampler2D positionsTexture;
uniform sampler2D pointGreyoutStatus;
uniform sampler2D imageAtlasCoords;
uniform float ratio;
uniform mat3 transformationMatrix;
uniform float pointsTextureSize;
uniform float sizeScale;
uniform float spaceSize;
uniform vec2 screenSize;

uniform vec4 greyoutColor;
uniform vec4 backgroundColor;
uniform bool scalePointsOnZoom;
uniform float maxPointSize;
uniform bool isDarkenGreyout;
uniform bool skipSelected;
uniform bool skipUnselected;
uniform bool hasImages;
uniform float imageCount;
uniform float imageAtlasCoordsTextureSize;

varying float pointShape;
varying float isGreyedOut;
varying vec4 shapeColor;
varying vec4 imageAtlasUV;
varying float shapeSize;
varying float imageSizeVarying;
varying float overallSize;

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
  // Check greyout status for selective rendering
  vec4 greyoutStatus = texture2D(pointGreyoutStatus, (pointIndices + 0.5) / pointsTextureSize);
  isGreyedOut = greyoutStatus.r;
  bool isSelected = greyoutStatus.r == 0.0;
  
  // Discard point based on rendering mode
  if (skipSelected && isSelected) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Move off-screen
    gl_PointSize = 0.0;
    return;
  }
  if (skipUnselected && !isSelected) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Move off-screen
    gl_PointSize = 0.0;
    return;
  }
  
  // Position
  vec4 pointPosition = texture2D(positionsTexture, (pointIndices + 0.5) / pointsTextureSize);
  vec2 point = pointPosition.rg;

  // Transform point position to normalized device coordinates
  vec2 normalizedPosition = 2.0 * point / spaceSize - 1.0;
  normalizedPosition *= spaceSize / screenSize;
  vec3 finalPosition = transformationMatrix * vec3(normalizedPosition, 1);
  gl_Position = vec4(finalPosition.rg, 0, 1);

  // Calculate sizes for shape and image
  float shapeSizeValue = calculatePointSize(size * sizeScale);
  float imageSizeValue = calculatePointSize(imageSize * sizeScale);
  
  // Use the larger of the two sizes for the overall point size
  float overallSizeValue = max(shapeSizeValue, imageSizeValue);
  gl_PointSize = overallSizeValue;

  // Pass size information to fragment shader
  shapeSize = shapeSizeValue;
  imageSizeVarying = imageSizeValue;
  overallSize = overallSizeValue;

  shapeColor = color;
  pointShape = shape;

  // Adjust alpha of selected points
  if (isGreyedOut > 0.0) {
    if (greyoutColor[0] != -1.0) {
      shapeColor = greyoutColor;
    } else {
      // If greyoutColor is not set, make color lighter or darker based on isDarkenGreyout
      float blendFactor = 0.65; // Controls how much to modify (0.0 = original, 1.0 = target color)
      
      if (isDarkenGreyout) {
        // Darken the color
        shapeColor.rgb = mix(shapeColor.rgb, vec3(0.2), blendFactor);
      } else {
        // Lighten the color
        shapeColor.rgb = mix(shapeColor.rgb, max(backgroundColor.rgb, vec3(0.8)), blendFactor);
      }
    }
  }

  if (!hasImages || imageIndex < 0.0 || imageIndex >= imageCount) {
    imageAtlasUV = vec4(-1.0);
    return;
  }
  // Calculate image atlas UV coordinates based on imageIndex
  float atlasCoordIndex = imageIndex;
  // Calculate the position in the texture grid
  float texX = mod(atlasCoordIndex, imageAtlasCoordsTextureSize);
  float texY = floor(atlasCoordIndex / imageAtlasCoordsTextureSize);
  // Convert to texture coordinates (0.0 to 1.0)
  vec2 atlasCoordTexCoord = (vec2(texX, texY) + 0.5) / imageAtlasCoordsTextureSize;
  vec4 atlasCoords = texture2D(imageAtlasCoords, atlasCoordTexCoord);
  imageAtlasUV = atlasCoords;
} 