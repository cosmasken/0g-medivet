/**
 * Client-side encryption utilities for medical files
 * Implements AES-256-GCM encryption with PBKDF2 key derivation
 */

export interface EncryptionMetadata {
  salt: string          // Base64 encoded
  iv: string           // Base64 encoded  
  authTag: string      // Base64 encoded
  originalSize: number
  mimeType: string
  algorithm: 'AES-256-GCM'
}

export interface EncryptedFileResult {
  encryptedData: ArrayBuffer
  metadata: EncryptionMetadata
}

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM'
  private static readonly KEY_LENGTH = 256
  private static readonly IV_LENGTH = 12
  private static readonly SALT_LENGTH = 32
  private static readonly PBKDF2_ITERATIONS = 100000

  /**
   * Encrypts a file using AES-256-GCM with user's wallet address as key source
   */
  async encryptFile(file: File, walletAddress: string): Promise<EncryptedFileResult> {
    try {
      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(EncryptionService.SALT_LENGTH))
      const iv = crypto.getRandomValues(new Uint8Array(EncryptionService.IV_LENGTH))

      // Derive encryption key from wallet address
      const key = await this.deriveKey(walletAddress, salt)

      // Read file as ArrayBuffer
      const fileData = await file.arrayBuffer()

      // Encrypt the file data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: EncryptionService.ALGORITHM,
          iv: iv
        },
        key,
        fileData
      )

      // Extract auth tag (last 16 bytes of encrypted data)
      const encryptedBytes = new Uint8Array(encryptedData)
      const authTag = encryptedBytes.slice(-16)
      const ciphertext = encryptedBytes.slice(0, -16)

      // Create metadata
      const metadata: EncryptionMetadata = {
        salt: this.arrayBufferToBase64(salt),
        iv: this.arrayBufferToBase64(iv),
        authTag: this.arrayBufferToBase64(authTag),
        originalSize: file.size,
        mimeType: file.type,
        algorithm: 'AES-256-GCM'
      }

      return {
        encryptedData: ciphertext.buffer,
        metadata
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decrypts a file using stored metadata and user's wallet address
   */
  async decryptFile(
    encryptedData: ArrayBuffer, 
    metadata: EncryptionMetadata, 
    walletAddress: string
  ): Promise<File> {
    try {
      // Parse metadata
      const salt = this.base64ToArrayBuffer(metadata.salt)
      const iv = this.base64ToArrayBuffer(metadata.iv)
      const authTag = this.base64ToArrayBuffer(metadata.authTag)

      // Derive the same key used for encryption
      const key = await this.deriveKey(walletAddress, new Uint8Array(salt))

      // Combine ciphertext and auth tag for decryption
      const encryptedWithTag = new Uint8Array(encryptedData.byteLength + authTag.byteLength)
      encryptedWithTag.set(new Uint8Array(encryptedData))
      encryptedWithTag.set(new Uint8Array(authTag), encryptedData.byteLength)

      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: EncryptionService.ALGORITHM,
          iv: new Uint8Array(iv)
        },
        key,
        encryptedWithTag
      )

      // Create File object from decrypted data
      return new File([decryptedData], 'decrypted-file', { type: metadata.mimeType })
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Derives encryption key from wallet address using PBKDF2
   */
  private async deriveKey(walletAddress: string, salt: Uint8Array): Promise<CryptoKey> {
    // Import wallet address as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(walletAddress.toLowerCase()),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    // Derive AES key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: EncryptionService.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: EncryptionService.ALGORITHM,
        length: EncryptionService.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Converts ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Converts Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService()
