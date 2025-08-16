import { Blob, MerkleTree } from '@0glabs/0g-ts-sdk';

/**
 * Creates a blob object from a file
 * @param file The file to create a blob from
 * @returns The blob object
 */
export function createBlob(file: File): Blob {
  return new Blob(file);
}

/**
 * Generates a Merkle tree from a blob
 * @param blob The blob to generate a Merkle tree from
 * @returns A promise that resolves to the Merkle tree and any error
 */
export async function generateMerkleTree(blob: Blob): Promise<[MerkleTree | null, Error | null]> {
  try {
    const [tree, treeErr] = await blob.merkleTree();
    if (treeErr !== null || !tree) {
      return [null, treeErr || new Error('Unknown error generating Merkle tree')];
    }
    return [tree, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Gets the root hash from a Merkle tree
 * @param tree The Merkle tree
 * @returns The root hash and any error
 */
export function getRootHash(tree: MerkleTree): [string | null, Error | null] {
  try {
    const hash = tree.rootHash();
    if (!hash) {
      return [null, new Error('Failed to get root hash')];
    }
    return [hash, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Creates a submission for upload from a blob
 * @param blob The blob to create a submission from
 * @returns A promise that resolves to the submission and any error
 */
export async function createSubmission(blob: Blob): Promise<[any | null, Error | null]> {
  try {
    const [submission, submissionErr] = await blob.createSubmission('0x');
    if (submissionErr !== null || submission === null) {
      return [null, submissionErr || new Error('Unknown error creating submission')];
    }
    return [submission, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
} 