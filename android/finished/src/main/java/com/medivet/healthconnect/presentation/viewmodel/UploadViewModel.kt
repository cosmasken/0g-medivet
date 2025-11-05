package com.medivet.healthconnect.presentation.viewmodel

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.repository.MediVetRepository
import com.medivet.healthconnect.presentation.screen.files.FileType
import com.medivet.healthconnect.util.EncryptionUtils
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

data class UploadUiState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null,
    val uploadedFileHash: String? = null,
    val encryptionEnabled: Boolean = true
)

class UploadViewModel : ViewModel() {
    private val repository = MediVetRepository(NetworkClient.apiService)

    private val _uiState = MutableStateFlow(UploadUiState())
    val uiState: StateFlow<UploadUiState> = _uiState

    fun uploadFile(
        context: Context,
        fileUri: Uri,
        fileName: String,
        category: String,
        fileType: FileType,
        userId: String,
        walletAddress: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                // Create temporary file from URI
                val inputStream = context.contentResolver.openInputStream(fileUri)
                val tempFile = File(context.cacheDir, fileName)
                val outputStream = FileOutputStream(tempFile)
                
                inputStream?.use { input ->
                    outputStream.use { output ->
                        input.copyTo(output)
                    }
                }

                var fileToUpload = tempFile
                var encryptionMetadata: EncryptionUtils.EncryptionMetadata? = null

                // Encrypt file if encryption is enabled and wallet address is available
                if (_uiState.value.encryptionEnabled && walletAddress != null) {
                    try {
                        val fileBytes = tempFile.readBytes()
                        val mimeType = context.contentResolver.getType(fileUri) ?: "application/octet-stream"
                        
                        val encryptionResult = EncryptionUtils.encryptFile(fileBytes, walletAddress, mimeType)
                        
                        // Create new encrypted file
                        val encryptedFile = File(context.cacheDir, "encrypted_$fileName")
                        encryptedFile.writeBytes(encryptionResult.encryptedData)
                        
                        fileToUpload = encryptedFile
                        encryptionMetadata = encryptionResult.metadata
                        
                    } catch (encryptionError: Exception) {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = "Encryption failed: ${encryptionError.message}"
                        )
                        return@launch
                    }
                }

                // Create multipart body
                val requestFile = fileToUpload.asRequestBody("*/*".toMediaTypeOrNull())
                val filePart = MultipartBody.Part.createFormData("file", fileName, requestFile)

                // Create metadata JSON
                val metadata = JSONObject().apply {
                    put("userId", userId)
                    put("title", fileName)
                    put("description", if (encryptionMetadata != null) "Encrypted file uploaded from mobile app" else "Uploaded from mobile app")
                    put("category", category)
                    put("specialty", category)
                    put("fileType", fileType.name.lowercase())
                    put("tags", arrayOf(category.lowercase(), fileType.name.lowercase()))
                    if (encryptionMetadata != null) {
                        put("encryptionMetadata", JSONObject().apply {
                            put("salt", encryptionMetadata.salt)
                            put("iv", encryptionMetadata.iv)
                            put("authTag", encryptionMetadata.authTag)
                            put("originalSize", encryptionMetadata.originalSize)
                            put("mimeType", encryptionMetadata.mimeType)
                            put("algorithm", encryptionMetadata.algorithm)
                        })
                    }
                }

                val metadataBody = metadata.toString().toRequestBody("application/json".toMediaTypeOrNull())

                // Upload file
                val response = repository.uploadFile(metadataBody, filePart)

                if (response.isSuccessful && response.body() != null) {
                    val uploadResponse = response.body()!!
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isSuccess = true,
                        uploadedFileHash = uploadResponse.rootHash
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Upload failed: ${response.message()}"
                    )
                }

                // Clean up temp files
                tempFile.delete()
                if (fileToUpload != tempFile) {
                    fileToUpload.delete()
                }

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Upload error: ${e.message}"
                )
            }
        }
    }

    fun toggleEncryption(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(encryptionEnabled = enabled)
    }

    fun clearState() {
        _uiState.value = UploadUiState()
    }
}
