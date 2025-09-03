import { Blob } from '@0glabs/0g-ts-sdk/browser';

export function createBlobFromFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = new Blob(uint8Array);
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function createBlobFromText(text: string): Blob {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(text);
  return new Blob(uint8Array);
}
