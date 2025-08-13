/**
 * Creates a texture atlas from an array of ImageData objects.
 *
 * A texture atlas is a single large texture that contains multiple smaller images.
 * This allows efficient rendering by reducing the number of texture bindings needed.
 *
 * The atlas uses a grid layout where each image gets a square region sized to
 * accommodate the largest image dimension. Images are placed left-to-right, top-to-bottom.
 *
 * @param imageDataArray - Array of ImageData objects to pack into the atlas
 * @param webglMaxTextureSize - WebGL maximum texture size limit (default: 16384)
 * @returns Atlas data object containing:
 *   - atlasData: RGBA pixel data as Uint8Array
 *   - atlasSize: Total atlas texture size in pixels
 *   - atlasCoords: UV coordinates for each image as Float32Array
 *   - atlasCoordsSize: Grid size (number of rows/columns)
 *   Returns null if creation fails or no valid images provided
 */
export function createAtlasDataFromImageData (
  imageDataArray: ImageData[],
  webglMaxTextureSize = 16384
): {
  atlasData: Uint8Array;
  atlasSize: number;
  atlasCoords: Float32Array;
  atlasCoordsSize: number;
} | null {
  // Step 1: Validate input - ensure we have images to process
  if (!imageDataArray?.length) {
    return null
  }

  // Step 2: Find the maximum dimension across all images
  // The max dimension determines the size of each grid cell in the atlas
  let maxDimension = 0
  for (const imageData of imageDataArray) {
    const dimension = Math.max(imageData.width, imageData.height)
    if (dimension > maxDimension) {
      maxDimension = dimension
    }
  }

  // Step 3: Validate that we found valid image dimensions
  if (maxDimension === 0) {
    console.warn('Invalid image dimensions: all images have zero width or height')
    return null
  }

  const originalMaxDimension = maxDimension

  // Step 4: Calculate optimal atlas grid size
  const atlasCoordsSize = Math.ceil(Math.sqrt(imageDataArray.length))
  let atlasSize = atlasCoordsSize * maxDimension

  // Step 5: Apply WebGL size limit scaling if necessary
  let scalingFactor = 1.0

  if (atlasSize > webglMaxTextureSize) {
    // Calculate required scale to fit within WebGL limits
    scalingFactor = webglMaxTextureSize / atlasSize

    // Apply scaling to both the individual image dimensions and atlas size
    maxDimension = Math.max(1, Math.floor(maxDimension * scalingFactor))
    atlasSize = Math.max(1, Math.floor(atlasSize * scalingFactor))

    console.warn(
      '🖼️  Atlas scaling required: Original size ' +
      `${(originalMaxDimension * atlasCoordsSize).toLocaleString()}px exceeds WebGL limit ` +
      `${webglMaxTextureSize.toLocaleString()}px. Scaling down to ${atlasSize.toLocaleString()}px ` +
      `(${Math.round(scalingFactor * 100)}% of original quality)`
    )
  }

  // Step 6: Create buffers for atlas data
  const atlasData = new Uint8Array(atlasSize * atlasSize * 4).fill(0)
  const atlasCoords = new Float32Array(atlasCoordsSize * atlasCoordsSize * 4).fill(-1)

  // Step 7: Pack each image into the atlas grid
  for (const [index, imageData] of imageDataArray.entries()) {
    const originalWidth = imageData.width
    const originalHeight = imageData.height
    if (originalWidth === 0 || originalHeight === 0) {
      // leave coords at -1 for this index and continue
      continue
    }

    // Calculate individual scale for this image based on maxDimension
    // This ensures each image fits optimally within its grid cell
    const individualScale = Math.min(1.0, maxDimension / Math.max(originalWidth, originalHeight))

    const scaledWidth = Math.floor(originalWidth * individualScale)
    const scaledHeight = Math.floor(originalHeight * individualScale)

    // Calculate grid position (row, column) for this image
    const row = Math.floor(index / atlasCoordsSize)
    const col = index % atlasCoordsSize

    // Calculate pixel position in the atlas texture
    const atlasX = col * maxDimension
    const atlasY = row * maxDimension

    // Calculate and store UV coordinates for this image
    atlasCoords[index * 4] = atlasX / atlasSize // minU
    atlasCoords[index * 4 + 1] = atlasY / atlasSize // minV
    atlasCoords[index * 4 + 2] = (atlasX + scaledWidth) / atlasSize // maxU
    atlasCoords[index * 4 + 3] = (atlasY + scaledHeight) / atlasSize // maxV

    // Copy image pixel data into the atlas texture
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        // Calculate source pixel coordinates (with scaling)
        const srcX = Math.floor(x * (originalWidth / scaledWidth))
        const srcY = Math.floor(y * (originalHeight / scaledHeight))

        // Calculate source pixel index in the original image
        const srcIndex = (srcY * originalWidth + srcX) * 4

        // Calculate target pixel index in the atlas texture
        const atlasIndex = ((atlasY + y) * atlasSize + (atlasX + x)) * 4

        // Copy RGBA values from source to atlas
        atlasData[atlasIndex] = imageData.data[srcIndex] ?? 0 // Red channel
        atlasData[atlasIndex + 1] = imageData.data[srcIndex + 1] ?? 0 // Green channel
        atlasData[atlasIndex + 2] = imageData.data[srcIndex + 2] ?? 0 // Blue channel
        atlasData[atlasIndex + 3] = imageData.data[srcIndex + 3] ?? 255 // Alpha channel
      }
    }
  }

  // Return the complete atlas data
  return {
    atlasData,
    atlasSize,
    atlasCoords,
    atlasCoordsSize,
  }
}
