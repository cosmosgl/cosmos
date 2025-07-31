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
 * @param maxPointSize - Maximum point size (used to set the grid cell size for fitting images within this dimension)
 * @returns Atlas data containing the packed texture and UV coordinates, or null if creation fails
 */
export function createAtlasDataFromImageData (
  imageDataArray: ImageData[],
  maxPointSize?: number
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
  // This determines the size of each grid cell in the atlas
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

  // Step 4: Use maxPointSize if it's smaller than maxDimension to avoid creating overly large textures
  if (maxPointSize !== undefined && maxPointSize < maxDimension) {
    maxDimension = Math.floor(maxPointSize)
  }

  // Step 5: Calculate atlas grid dimensions
  // Grid size is the square root of image count (rounded up)
  // Total atlas size is grid size * max image dimension
  const atlasCoordsSize = Math.ceil(Math.sqrt(imageDataArray.length))
  const atlasSize = atlasCoordsSize * maxDimension

  // Step 6: Create buffers for atlas data
  // atlasData: RGBA pixel data for the entire atlas texture (4 bytes per pixel)
  const atlasData = new Uint8Array(atlasSize * atlasSize * 4).fill(0)
  // atlasCoords: UV coordinates for each image [minU, minV, maxU, maxV] (4 floats per image)
  const atlasCoords = new Float32Array(atlasCoordsSize * atlasCoordsSize * 4).fill(-1)

  // Step 7: Pack each image into the atlas grid
  // Uses nearest neighbor sampling for images larger than maxDimension
  for (const [index, imageData] of imageDataArray.entries()) {
    // Extract image dimensions
    const originalWidth = imageData.width
    const originalHeight = imageData.height

    // Calculate scaled dimensions if image is larger than maxDimension
    let scaledWidth = originalWidth
    let scaledHeight = originalHeight

    if (originalWidth > maxDimension || originalHeight > maxDimension) {
      const scale = Math.min(maxDimension / originalWidth, maxDimension / originalHeight)
      scaledWidth = Math.floor(originalWidth * scale)
      scaledHeight = Math.floor(originalHeight * scale)
    }

    // Calculate grid position (row, column) for this image
    // Images are placed left-to-right, top-to-bottom in the grid
    const row = Math.floor(index / atlasCoordsSize)
    const col = index % atlasCoordsSize

    // Calculate pixel position in the atlas texture
    // Each grid cell is maxDimension x maxDimension pixels
    const atlasX = col * maxDimension
    const atlasY = row * maxDimension

    // Step 8: Calculate and store UV coordinates for this image
    // UV coordinates are normalized texture coordinates (0.0 to 1.0)
    // They tell the shader where to find this image within the atlas
    atlasCoords[index * 4] = atlasX / atlasSize // minU - left edge of image
    atlasCoords[index * 4 + 1] = atlasY / atlasSize // minV - top edge of image
    atlasCoords[index * 4 + 2] = (atlasX + scaledWidth) / atlasSize // maxU - right edge of image
    atlasCoords[index * 4 + 3] = (atlasY + scaledHeight) / atlasSize // maxV - bottom edge of image

    // Step 9: Copy image pixel data into the atlas texture
    // This copies each pixel from the source image to its position in the atlas
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        // Calculate source pixel coordinates (with scaling)
        const srcX = Math.floor(x * (originalWidth / scaledWidth))
        const srcY = Math.floor(y * (originalHeight / scaledHeight))

        // Calculate source pixel index in the original image
        // Each pixel is 4 bytes (RGBA): [R, G, B, A]
        const srcIndex = (srcY * originalWidth + srcX) * 4

        // Calculate target pixel index in the atlas texture
        // Position is offset by atlasX and atlasY within the grid cell
        const atlasIndex = ((atlasY + y) * atlasSize + (atlasX + x)) * 4

        // Copy RGBA values from source to atlas with fallback defaults
        // Use nullish coalescing (??) to handle undefined values
        atlasData[atlasIndex] = imageData.data[srcIndex] ?? 0 // Red channel
        atlasData[atlasIndex + 1] = imageData.data[srcIndex + 1] ?? 0 // Green channel
        atlasData[atlasIndex + 2] = imageData.data[srcIndex + 2] ?? 0 // Blue channel
        atlasData[atlasIndex + 3] = imageData.data[srcIndex + 3] ?? 255 // Alpha channel (default to opaque)
      }
    }
  }

  // Step 10: Return the complete atlas data
  return {
    atlasData, // The packed texture data (RGBA pixels)
    atlasSize, // Width/height of the atlas texture in pixels
    atlasCoords, // UV coordinates for each image in the atlas
    atlasCoordsSize, // Size of the atlas grid (e.g., 3x3 grid = 3)
  }
}
