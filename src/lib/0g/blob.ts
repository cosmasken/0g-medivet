import { Blob } from '@0glabs/0g-ts-sdk/browser';

export function createBlobFromFile(file: File): Blob {
  // 0G SDK Blob constructor expects a File object directly
  return new Blob(file);
}

export function createBlobFromText(text: string): Blob {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(text);
  const file = new File([uint8Array], 'text.txt', { type: 'text/plain' });
  return new Blob(file);
}
