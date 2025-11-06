/**
 * Blob creation and handling utilities for 0G Storage
 */

import { Blob, MerkleTree } from '@0glabs/0g-ts-sdk';

/**
 * Create a blob from a file
 */
export function createBlob(file: File): Blob {
  return new Blob(file);
}

/**
 * Generate a merkle tree from a blob
 */
export async function generateMerkleTree(blob: Blob): Promise<[MerkleTree | null, Error | null]> {
  try {
    const tree = new MerkleTree(blob);
    await tree.merkleTree();
    return [tree, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Get root hash from merkle tree
 */
export function getRootHash(tree: MerkleTree): [string | null, Error | null] {
  try {
    const rootHash = tree.rootHash();
    return [rootHash, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Create submission data from blob
 */
export async function createSubmission(blob: Blob): Promise<[any | null, Error | null]> {
  try {
    const submission = await blob.createSubmission();
    return [submission, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
