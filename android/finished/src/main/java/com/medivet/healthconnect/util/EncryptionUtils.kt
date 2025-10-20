package com.medivet.healthconnect.util

import android.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import javax.crypto.SecretKeyFactory

/**
 * Client-side encryption utilities for medical files
 * Implements AES-256-GCM encryption with PBKDF2 key derivation
 */
object EncryptionUtils {
    
    private const val ALGORITHM = "AES"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val KEY_LENGTH = 256
    private const val IV_LENGTH = 12
    private const val SALT_LENGTH = 32
    private const val TAG_LENGTH = 16
    private const val PBKDF2_ITERATIONS = 100000

    data class EncryptedFileResult(
        val encryptedData: ByteArray,
        val metadata: EncryptionMetadata
    )

    data class EncryptionMetadata(
        val salt: String,
        val iv: String,
        val authTag: String,
        val originalSize: Long,
        val mimeType: String,
        val algorithm: String = "AES-256-GCM"
    )

    /**
     * Encrypts file data using AES-256-GCM with user's wallet address as key source
     */
    suspend fun encryptFile(
        fileBytes: ByteArray,
        walletAddress: String,
        mimeType: String = "application/octet-stream"
    ): EncryptedFileResult = withContext(Dispatchers.Default) {
        try {
            // Generate random salt and IV
            val salt = ByteArray(SALT_LENGTH)
            val iv = ByteArray(IV_LENGTH)
            SecureRandom().nextBytes(salt)
            SecureRandom().nextBytes(iv)

            // Derive encryption key from wallet address
            val key = deriveKey(walletAddress, salt)

            // Initialize cipher for encryption
            val cipher = Cipher.getInstance(TRANSFORMATION)
            val gcmSpec = GCMParameterSpec(TAG_LENGTH * 8, iv)
            cipher.init(Cipher.ENCRYPT_MODE, key, gcmSpec)

            // Encrypt the file data
            val encryptedData = cipher.doFinal(fileBytes)

            // Extract auth tag (last 16 bytes)
            val ciphertext = encryptedData.sliceArray(0 until encryptedData.size - TAG_LENGTH)
            val authTag = encryptedData.sliceArray(encryptedData.size - TAG_LENGTH until encryptedData.size)

            // Create metadata
            val metadata = EncryptionMetadata(
                salt = Base64.encodeToString(salt, Base64.NO_WRAP),
                iv = Base64.encodeToString(iv, Base64.NO_WRAP),
                authTag = Base64.encodeToString(authTag, Base64.NO_WRAP),
                originalSize = fileBytes.size.toLong(),
                mimeType = mimeType
            )

            EncryptedFileResult(ciphertext, metadata)
        } catch (e: Exception) {
            throw Exception("Encryption failed: ${e.message}", e)
        }
    }

    /**
     * Decrypts file data using stored metadata and user's wallet address
     */
    suspend fun decryptFile(
        encryptedData: ByteArray,
        metadata: EncryptionMetadata,
        walletAddress: String
    ): ByteArray = withContext(Dispatchers.Default) {
        try {
            // Parse metadata
            val salt = Base64.decode(metadata.salt, Base64.NO_WRAP)
            val iv = Base64.decode(metadata.iv, Base64.NO_WRAP)
            val authTag = Base64.decode(metadata.authTag, Base64.NO_WRAP)

            // Derive the same key used for encryption
            val key = deriveKey(walletAddress, salt)

            // Combine ciphertext and auth tag
            val encryptedWithTag = encryptedData + authTag

            // Initialize cipher for decryption
            val cipher = Cipher.getInstance(TRANSFORMATION)
            val gcmSpec = GCMParameterSpec(TAG_LENGTH * 8, iv)
            cipher.init(Cipher.DECRYPT_MODE, key, gcmSpec)

            // Decrypt the data
            cipher.doFinal(encryptedWithTag)
        } catch (e: Exception) {
            throw Exception("Decryption failed: ${e.message}", e)
        }
    }

    /**
     * Derives encryption key from wallet address using PBKDF2
     */
    private fun deriveKey(walletAddress: String, salt: ByteArray): SecretKey {
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val spec = PBEKeySpec(
            walletAddress.lowercase().toCharArray(),
            salt,
            PBKDF2_ITERATIONS,
            KEY_LENGTH
        )
        val key = factory.generateSecret(spec)
        return SecretKeySpec(key.encoded, ALGORITHM)
    }

    /**
     * Validates encryption metadata format
     */
    fun validateMetadata(metadata: EncryptionMetadata): Boolean {
        return try {
            Base64.decode(metadata.salt, Base64.NO_WRAP).size == SALT_LENGTH &&
            Base64.decode(metadata.iv, Base64.NO_WRAP).size == IV_LENGTH &&
            Base64.decode(metadata.authTag, Base64.NO_WRAP).size == TAG_LENGTH &&
            metadata.originalSize > 0 &&
            metadata.algorithm == "AES-256-GCM"
        } catch (e: Exception) {
            false
        }
    }
}
