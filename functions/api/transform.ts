import { PhotonImage, resize, SamplingFilter } from '@cf-wasm/photon';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// BMP encoder: 32-bit BGRA with premultiplied alpha.
// RGB values are multiplied by alpha before storage so that programs supporting
// premultiplied alpha (Pixelformer, WPF, GDI+, etc.) render transparency correctly.
// Fully opaque pixels are unaffected (premult of alpha=255 is identity).
function encodeBmp(rgba: Uint8Array, width: number, height: number): Uint8Array {
  const rowSize = width * 4; // 32-bit pixels are always 4-byte aligned, no padding needed
  const pixelDataSize = rowSize * height;
  const buf = new ArrayBuffer(54 + pixelDataSize);
  const view = new DataView(buf);

  // File header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, 54 + pixelDataSize, true); // file size
  view.setUint32(6, 0, true);   // reserved
  view.setUint32(10, 54, true); // pixel data offset

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true);      // header size
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);   // positive = bottom-up (standard BMP, max compatibility)
  view.setUint16(26, 1, true);       // color planes
  view.setUint16(28, 32, true);      // bits per pixel: 32 (BGRA)
  view.setUint32(30, 0, true);       // compression: BI_RGB
  view.setUint32(34, pixelDataSize, true);
  view.setInt32(38, 2835, true);     // X pixels/meter (~72 DPI)
  view.setInt32(42, 2835, true);     // Y pixels/meter
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  // Pixel data: BGRA, premultiplied alpha, bottom-up row order
  const out = new Uint8Array(buf);
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y; // bottom-up: last row of source → first row of BMP
    for (let x = 0; x < width; x++) {
      const src = (srcRow * width + x) * 4;
      const dst = 54 + y * rowSize + x * 4;
      const a = rgba[src + 3];
      out[dst]     = (rgba[src + 2] * a + 127) >>> 8; // B premultiplied
      out[dst + 1] = (rgba[src + 1] * a + 127) >>> 8; // G premultiplied
      out[dst + 2] = (rgba[src]     * a + 127) >>> 8; // R premultiplied
      out[dst + 3] = a;                                // A
    }
  }
  return out;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function err(msg: string, status: number): Response {
  return new Response(msg, { status, headers: CORS_HEADERS });
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const reqContentType = context.request.headers.get('Content-Type') ?? '';
    if (!reqContentType.includes('multipart/form-data')) {
      return err('Content-Type must be multipart/form-data', 400);
    }

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return err('No file uploaded', 400);
    if (file.size > MAX_SIZE) return err('File exceeds 10MB limit', 413);

    const width = parseInt((formData.get('width') as string) || '0') || 0;
    const height = parseInt((formData.get('height') as string) || '0') || 0;
    const format = ((formData.get('format') as string) || 'webp').toLowerCase();
    const quality = Math.min(100, Math.max(1, parseInt((formData.get('quality') as string) || '80')));
    const maintainAspect = (formData.get('maintainAspect') as string) !== 'false';

    const fileBytes = new Uint8Array(await file.arrayBuffer());

    // Build cache key: SHA-256(file bytes + transform params)
    const paramBytes = new TextEncoder().encode(`${width}x${height}:${format}:${quality}:${maintainAspect}`);
    const combined = new Uint8Array(fileBytes.length + paramBytes.length);
    combined.set(fileBytes);
    combined.set(paramBytes, fileBytes.length);

    const hashBuf = await crypto.subtle.digest('SHA-256', combined);
    const hash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Check Workers Cache
    const cache = caches.default;
    const cacheKey = new Request(`https://flashresizer.internal/cache/${hash}`);
    const cached = await cache.match(cacheKey);
    if (cached) {
      return new Response(cached.body, {
        headers: { ...Object.fromEntries(cached.headers), ...CORS_HEADERS, 'X-Cache': 'HIT' },
      });
    }

    // Process image with @cf-wasm/photon
    let image = PhotonImage.new_from_byteslice(fileBytes);

    if (width > 0 || height > 0) {
      const origW = image.get_width();
      const origH = image.get_height();
      let targetW = width || origW;
      let targetH = height || origH;

      if (maintainAspect) {
        if (width > 0 && height === 0) {
          targetH = Math.round(origH * (width / origW));
        } else if (height > 0 && width === 0) {
          targetW = Math.round(origW * (height / origH));
        } else {
          // Both given: fit within bounds (no crop)
          const scale = Math.min(width / origW, height / origH);
          targetW = Math.round(origW * scale);
          targetH = Math.round(origH * scale);
        }
      }

      const resized = resize(image, targetW, targetH, SamplingFilter.Lanczos3);
      image.free();
      image = resized;
    }

    // Encode to target format
    // Note: AVIF is not yet supported by @cf-wasm/photon; falls back to WebP
    let outputBytes: Uint8Array;
    let contentType: string;

    switch (format) {
      case 'jpeg':
      case 'jpg':
        outputBytes = image.get_bytes_jpeg(quality);
        contentType = 'image/jpeg';
        break;
      case 'webp':
      case 'avif': // fallback until AVIF WASM encoder is added in Phase 2
        outputBytes = image.get_bytes_webp();
        contentType = 'image/webp';
        break;
      case 'bmp':
        outputBytes = encodeBmp(image.get_raw_pixels(), image.get_width(), image.get_height());
        contentType = 'image/bmp';
        break;
      case 'png':
      default:
        outputBytes = image.get_bytes();
        contentType = 'image/png';
        break;
    }

    image.free();

    const response = new Response(outputBytes, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
      },
    });

    // Store in cache asynchronously
    context.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  } catch (e) {
    console.error('[transform]', e);
    return err('Internal server error', 500);
  }
};
