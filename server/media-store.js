import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDirectory = join(__dirname, '.runtime', 'uploads');

const imageExtensionMap = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const videoExtensionMap = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
};

function slugifyFileName(value) {
  return String(value || 'image')
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'image';
}

function resolveExtension(mimeType, fileName) {
  if (imageExtensionMap[mimeType]) {
    return imageExtensionMap[mimeType];
  }

  const existingExtension = extname(String(fileName || '')).toLowerCase();
  if (existingExtension) {
    return existingExtension;
  }

  return '.png';
}

function resolveVideoExtension(mimeType, fileName) {
  if (videoExtensionMap[mimeType]) {
    return videoExtensionMap[mimeType];
  }

  const existingExtension = extname(String(fileName || '')).toLowerCase();
  if (existingExtension) {
    return existingExtension;
  }

  return '.mp4';
}

export function getUploadsDirectory() {
  return uploadsDirectory;
}

export async function saveBase64ImageUpload({ dataUrl, fileName }) {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Please select a valid image file.');
  }

  const [, mimeType, base64Payload] = match;
  const buffer = Buffer.from(base64Payload, 'base64');

  if (!buffer.length) {
    throw new Error('Uploaded image is empty.');
  }

  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error('Image must be smaller than 8 MB.');
  }

  const extension = resolveExtension(mimeType, fileName);
  const safeName = `${Date.now()}-${slugifyFileName(fileName)}${extension}`;
  const absolutePath = join(uploadsDirectory, safeName);

  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    fileName: safeName,
    relativeUrl: `/uploads/${safeName}`,
  };
}

export async function saveBase64VideoUpload({ dataUrl, fileName }) {
  const match = String(dataUrl || '').match(/^data:(video\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Please select a valid video file.');
  }

  const [, mimeType, base64Payload] = match;
  const buffer = Buffer.from(base64Payload, 'base64');

  if (!buffer.length) {
    throw new Error('Uploaded video is empty.');
  }

  if (buffer.length > 40 * 1024 * 1024) {
    throw new Error('Video must be smaller than 40 MB.');
  }

  const extension = resolveVideoExtension(mimeType, fileName);
  const safeName = `${Date.now()}-${slugifyFileName(fileName)}${extension}`;
  const absolutePath = join(uploadsDirectory, safeName);

  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    fileName: safeName,
    relativeUrl: `/uploads/${safeName}`,
  };
}
