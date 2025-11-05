/**
 * Calculate the Merkle root hash from a File object in browser environment
 * This function computes the full merkle tree for the file using the 0G SDK
 */
export async function calculateMerkleRootFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        // Import the 0G SDK Blob after the file is loaded
        const { Blob } = await import('@0glabs/0g-ts-sdk/browser');
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Create a blob from the file data
        const blob = new Blob(uint8Array);
        
        // Try to get the root hash directly if available
        if (blob && (blob as any).root) {
          resolve((blob as any).root);
          return;
        } else if (blob && (blob as any).merkleRoot) {
          resolve((blob as any).merkleRoot);
          return;
        }
        
        // If not directly available, compute the full merkle tree
        // The AbstractFile has a merkleTree() method that returns the full tree
        try {
          // The merkleTree method is async and returns a MerkleTree object
          const [merkleTree, error] = await (blob as any).merkleTree();
          if (error) {
            console.warn('Error computing merkle tree:', error);
            // Fallback: try to access root directly again (maybe it's populated after merkleTree call)
            if (blob && (blob as any).root) {
              resolve((blob as any).root);
            } else {
              reject(new Error(`Merkle tree computation failed: ${error.message}`));
            }
            return;
          }
          
          if (merkleTree) {
            const rootHash = merkleTree.rootHash();
            if (rootHash) {
              resolve(rootHash);
            } else {
              reject(new Error('Merkle tree computed but no root hash available'));
            }
          } else {
            reject(new Error('Merkle tree computation returned null'));
          }
        } catch (treeError) {
          console.warn('Error computing merkle tree:', treeError);
          // As a last resort, try to access root directly again
          if (blob && (blob as any).root) {
            resolve((blob as any).root);
          } else {
            reject(new Error('Unable to calculate root hash from file'));
          }
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract the Merkle root from an existing Blob object
 */
export function extractMerkleRootFromBlob(blob: any): string | null {
  // The exact property name may vary depending on the SDK version
  if (blob && blob.root) {
    return blob.root;
  } else if (blob && blob.merkleRoot) {
    return blob.merkleRoot;
  } else {
    return null;
  }
}