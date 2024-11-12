interface ImageProcessingOptions {
  size?: number // Image size in pixels, will be adjusted to multiple of 8
}

// Unified function that accepts either input type
export async function processImage(
  input: string | Uint8Array,
  options: ImageProcessingOptions = {}
): Promise<{ data: Uint8Array }> {
  let result

  if (input instanceof Uint8Array) {
    result = await processImageFromArray(input, options)
  } else {
    result = await processImageFromUrl(input, options)
  }

  // Create command array for raster mode
  const command = new Uint8Array([
    0x1d,
    0x76,
    0x30,
    0x00, // GS v 0 0 (raster mode)
    result.width / 8,
    0, // xL xH (bytes per line)
    result.height & 0xff,
    (result.height >> 8) & 0xff, // yL yH (total lines)
  ])

  // Create the final byte array
  const combinedData = new Uint8Array(command.length + result.data.length)

  let offset = 0
  combinedData.set(command, offset)
  offset += command.length
  combinedData.set(result.data, offset)
  return { data: combinedData }
}

// Function to process image from URL string
async function processImageFromUrl(
  imageUrl: string,
  options: ImageProcessingOptions = {}
): Promise<{ data: Uint8Array; width: number; height: number }> {
  // Default to 384 if no size specified
  let targetSize = options.size ?? 384

  // Round to nearest multiple of 8 (required for printer)
  targetSize = Math.round(targetSize / 8) * 8

  // Load image
  const img = new Image()
  img.crossOrigin = "anonymous"
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = imageUrl
  })

  return processImageElement(img, targetSize)
}

// Function to process image from Uint8Array
async function processImageFromArray(
  imageData: Uint8Array,
  options: ImageProcessingOptions = {}
): Promise<{ data: Uint8Array; width: number; height: number }> {
  // Convert Uint8Array to blob
  const blob = new Blob([imageData], { type: "image/png" })
  const imageUrl = URL.createObjectURL(blob)

  try {
    // Default to 384 if no size specified
    let targetSize = options.size ?? 384

    // Round to nearest multiple of 8 (required for printer)
    targetSize = Math.round(targetSize / 8) * 8

    // Load image
    const img = new Image()
    img.crossOrigin = "anonymous"
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    return processImageElement(img, targetSize)
  } finally {
    // Clean up the blob URL
    URL.revokeObjectURL(imageUrl)
  }
}

// Shared processing logic for both methods
function processImageElement(
  img: HTMLImageElement,
  targetSize: number
): { data: Uint8Array; width: number; height: number } {
  // Calculate dimensions maintaining aspect ratio
  let finalWidth, finalHeight
  if (img.width >= img.height) {
    finalWidth = targetSize
    finalHeight = Math.round((img.height / img.width) * targetSize)
    // Ensure height is even for better printing
    finalHeight = Math.round(finalHeight / 2) * 2
  } else {
    finalHeight = targetSize
    finalWidth = Math.round((img.width / img.height) * targetSize)
    // Ensure width is multiple of 8 for printer compatibility
    finalWidth = Math.round(finalWidth / 8) * 8
  }

  // Create canvas with calculated dimensions
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  canvas.width = finalWidth
  canvas.height = finalHeight

  // Draw and process image
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  // Convert to grayscale
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = Math.floor(pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114)
    pixels[i] = pixels[i + 1] = pixels[i + 2] = grayscale
  }

  // Apply dithering
  applyAtkinsonDithering(pixels, canvas.width, canvas.height)

  // Convert to printer format
  const bytesPerLine = canvas.width / 8
  const rasterData = new Uint8Array(bytesPerLine * canvas.height)

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const pixelIndex = (y * canvas.width + x) * 4
      const byteIndex = y * bytesPerLine + Math.floor(x / 8)
      const bitIndex = 7 - (x % 8)

      if (pixels[pixelIndex] < 128) {
        rasterData[byteIndex] |= 1 << bitIndex
      }
    }
  }

  return {
    data: rasterData,
    width: canvas.width,
    height: canvas.height,
  }
}

// Keep the existing applyAtkinsonDithering function
function applyAtkinsonDithering(data: Uint8ClampedArray, width: number, height: number): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const oldPixel = data[i]
      const newPixel = oldPixel < 128 ? 0 : 255
      const error = Math.floor((oldPixel - newPixel) / 8)

      data[i] = data[i + 1] = data[i + 2] = newPixel

      if (x + 1 < width) {
        data[i + 4] += error
      }
      if (x + 2 < width) {
        data[i + 8] += error
      }
      if (y + 1 < height) {
        const nextRow = i + width * 4
        if (x - 1 >= 0) {
          data[nextRow - 4] += error
        }
        data[nextRow] += error
        if (x + 1 < width) {
          data[nextRow + 4] += error
        }
      }
      if (y + 2 < height) {
        data[i + width * 8] += error
      }
    }
  }
}
