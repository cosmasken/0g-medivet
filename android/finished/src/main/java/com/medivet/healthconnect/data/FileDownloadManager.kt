package com.medivet.healthconnect.data

import android.content.Context
import android.os.Environment
import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.util.EncryptionUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.ResponseBody
import retrofit2.Response
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

data class DownloadResult(
    val success: Boolean,
    val localPath: String? = null,
    val error: String? = null
)

data class DownloadProgress(
    val downloadId: String,
    val progress: Int, // 0-100
    val status: DownloadStatus
)

enum class DownloadStatus {
    PENDING,
    DOWNLOADING,
    DECRYPTING,
    COMPLETED,
    FAILED
}

class FileDownloadManager(private val context: Context) {
    
    private val apiService = NetworkClient.apiService
    
    /**
     * Downloads a file from 0G Storage using root hash
     */
    suspend fun downloadFile(
        rootHash: String,
        fileName: String,
        @Suppress("UNUSED_PARAMETER") mimeType: String = "application/octet-stream",
        networkType: String = "standard",
        walletAddress: String? = null,
        encryptionMetadata: EncryptionUtils.EncryptionMetadata? = null,
        onProgress: ((Int) -> Unit)? = null
    ): DownloadResult = withContext(Dispatchers.IO) {
        try {
            // Validate inputs
            if (rootHash.isBlank() || rootHash == "unknown" || rootHash == "undefined") {
                return@withContext DownloadResult(false, error = "Invalid root hash provided")
            }
            
            if (fileName.isBlank()) {
                return@withContext DownloadResult(false, error = "File name is required")
            }
            
            onProgress?.invoke(10)
            
            // Download file from server
            val response = apiService.downloadFileStream(rootHash, networkType, fileName)
            
            if (!response.isSuccessful) {
                val errorMessage = when (response.code()) {
                    404 -> "File not found in 0G Storage"
                    500 -> "Server error occurred"
                    else -> "Download failed: ${response.message()}"
                }
                return@withContext DownloadResult(false, error = errorMessage)
            }
            
            val responseBody = response.body()
                ?: return@withContext DownloadResult(false, error = "Empty response from server")
            
            onProgress?.invoke(30)
            
            // Create downloads directory
            val downloadsDir = File(
                context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), 
                "MediVet"
            )
            if (!downloadsDir.exists()) {
                downloadsDir.mkdirs()
            }
            
            // Save file to local storage
            val localFile = File(downloadsDir, fileName)
            val success = saveResponseBodyToFile(responseBody, localFile) { progress ->
                // Progress from 30% to 70% for download
                onProgress?.invoke(30 + (progress * 40 / 100))
            }
            
            if (!success) {
                return@withContext DownloadResult(false, error = "Failed to save file to device")
            }
            
            onProgress?.invoke(70)
            
            // Decrypt file if encryption metadata is provided
            if (encryptionMetadata != null && walletAddress != null) {
                try {
                    onProgress?.invoke(80)
                    
                    val encryptedBytes = localFile.readBytes()
                    val decryptedBytes = EncryptionUtils.decryptFile(
                        encryptedBytes, 
                        encryptionMetadata, 
                        walletAddress
                    )
                    
                    // Save decrypted file
                    val decryptedFile = File(downloadsDir, "decrypted_$fileName")
                    decryptedFile.writeBytes(decryptedBytes)
                    
                    // Delete encrypted file
                    localFile.delete()
                    
                    onProgress?.invoke(100)
                    
                    return@withContext DownloadResult(
                        success = true,
                        localPath = decryptedFile.absolutePath
                    )
                } catch (decryptionError: Exception) {
                    return@withContext DownloadResult(
                        false, 
                        error = "Decryption failed: ${decryptionError.message}"
                    )
                }
            }
            
            onProgress?.invoke(100)
            
            return@withContext DownloadResult(
                success = true,
                localPath = localFile.absolutePath
            )
            
        } catch (e: Exception) {
            return@withContext DownloadResult(
                false, 
                error = "Download error: ${e.message}"
            )
        }
    }
    
    /**
     * Verifies if a file exists in 0G Storage
     */
    suspend fun verifyFileExists(
        rootHash: String,
        networkType: String = "standard"
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            if (rootHash.isBlank() || rootHash == "unknown" || rootHash == "undefined") {
                return@withContext false
            }
            
            val response = apiService.verifyFile(rootHash, networkType)
            return@withContext response.isSuccessful && response.body()?.exists == true
        } catch (e: Exception) {
            return@withContext false
        }
    }
    
    /**
     * Gets the list of downloaded files
     */
    fun getDownloadedFiles(): List<File> {
        val downloadsDir = File(
            context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), 
            "MediVet"
        )
        return if (downloadsDir.exists()) {
            downloadsDir.listFiles()?.toList() ?: emptyList()
        } else {
            emptyList()
        }
    }
    
    /**
     * Deletes a downloaded file
     */
    fun deleteDownloadedFile(filePath: String): Boolean {
        return try {
            val file = File(filePath)
            file.delete()
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Gets the size of all downloaded files
     */
    fun getDownloadedFilesSize(): Long {
        return getDownloadedFiles().sumOf { it.length() }
    }
    
    /**
     * Clears all downloaded files
     */
    fun clearAllDownloads(): Boolean {
        return try {
            val downloadsDir = File(
                context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), 
                "MediVet"
            )
            if (downloadsDir.exists()) {
                downloadsDir.deleteRecursively()
            }
            true
        } catch (e: Exception) {
            false
        }
    }
    
    private fun saveResponseBodyToFile(
        body: ResponseBody, 
        file: File,
        onProgress: ((Int) -> Unit)? = null
    ): Boolean {
        return try {
            val inputStream: InputStream = body.byteStream()
            val outputStream = FileOutputStream(file)
            
            val buffer = ByteArray(4096)
            var totalBytesRead = 0L
            val contentLength = body.contentLength()
            
            inputStream.use { input ->
                outputStream.use { output ->
                    var bytesRead: Int
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        totalBytesRead += bytesRead
                        
                        // Report progress if content length is known
                        if (contentLength > 0) {
                            val progress = (totalBytesRead * 100 / contentLength).toInt()
                            onProgress?.invoke(progress)
                        }
                    }
                    output.flush()
                }
            }
            true
        } catch (e: Exception) {
            false
        }
    }
}