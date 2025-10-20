package com.medivet.healthconnect.presentation.viewmodel

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.repository.MediVetRepository
import com.medivet.healthconnect.presentation.screen.files.FileType
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
    val uploadedFileHash: String? = null
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
        userId: String
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

                // Create multipart body
                val requestFile = tempFile.asRequestBody("*/*".toMediaTypeOrNull())
                val filePart = MultipartBody.Part.createFormData("file", fileName, requestFile)

                // Create metadata JSON
                val metadata = JSONObject().apply {
                    put("userId", userId)
                    put("title", fileName)
                    put("description", "Uploaded from mobile app")
                    put("category", category)
                    put("specialty", category)
                    put("fileType", fileType.name.lowercase())
                    put("tags", arrayOf(category.lowercase(), fileType.name.lowercase()))
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

                // Clean up temp file
                tempFile.delete()

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Upload error: ${e.message}"
                )
            }
        }
    }

    fun clearState() {
        _uiState.value = UploadUiState()
    }
}
