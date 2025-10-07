// encryption.js - Client-side encryption utilities for HIPAA compliance
const CryptoJS = require('crypto-js');

class DataEncryption {
  constructor() {
    // In a real implementation, this would be a secure key management system
    // For now, using a placeholder - should be replaced with proper KMS
    this.encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required for data encryption');
    }
  }

  // Encrypt data before storing
  encrypt(data) {
    if (!data) return data;
    
    try {
      // Convert to string if it's an object
      const stringData = typeof data === 'string' ? data : JSON.stringify(data);
      return CryptoJS.AES.encrypt(stringData, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data after retrieving
  decrypt(encryptedData) {
    if (!encryptedData) return encryptedData;
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decryptedData);
      } catch {
        return decryptedData;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Encrypt entire object fields that contain sensitive data
  encryptObject(obj, sensitiveFields = []) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = { ...obj };
    
    for (const field of sensitiveFields) {
      if (result.hasOwnProperty(field) && result[field] !== undefined && result[field] !== null) {
        result[field] = this.encrypt(result[field]);
      }
    }
    
    return result;
  }

  // Decrypt object fields that were encrypted
  decryptObject(obj, sensitiveFields = []) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = { ...obj };
    
    for (const field of sensitiveFields) {
      if (result.hasOwnProperty(field) && result[field] !== undefined && result[field] !== null) {
        try {
          result[field] = this.decrypt(result[field]);
        } catch (error) {
          // If decryption fails, keep the encrypted value
          console.warn(`Failed to decrypt field ${field}:`, error.message);
        }
      }
    }
    
    return result;
  }
}

module.exports = new DataEncryption();