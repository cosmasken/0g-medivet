package com.medivet.healthconnect.presentation.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.FileDownloadManager
import com.medivet.healthconnect.data.DownloadResult
import com.medivet.healthconnect.data.DownloadStatus
import com.medivet.healthconnect.util.EncryptionUtils
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class DownloadUiState(
    val isLoading: Boolean = false,
    val progress: Int = 0,
    val status: DownloadStatus = DownloadStatus.PENDING,
    val downloadedFilePath: String? = null,
    val error: String? = null,
    val isSuccess: Boolean = false
)

class DownloadViewModel(application: Application) : AndroidViewModel(application) {
    
    private val downloadManager = FileDownloadManager(application)
    private val sharedPreferencesHelper = SharedPreferencesHelper.getInstance(application)
    
    private val _uiState = MutableStateFlow(DownloadUiState())
    val uiState: StateFlow<DownloadUiState> = _uiState

    fun downloadFile(
        rootHash: String,
        fileName: String,
        mimeType: String = "application/octet-stream",
        networkType: String = "standard",
        encryptionMetadata: EncryptionUtils.EncryptionMetadata? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                progress = 0,
                status = DownloadStatus.DOWNLOADING,
                error = null,
                isSuccess = false
            )

            try {
                // Get wallet address for decryption if needed
                val walletAddress = sharedPreferencesHelper.getWalletAddress()

                val result = downloadManager.downloadFile(
                    rootHash = rootHash,
                    fileName = fileName,
                    mimeType = mimeType,
                    networkType = networkType,
                    walletAddress = walletAddress,
                    encryptionMetadata = encryptionMetadata,
                    onProgress = { progress ->
                        _uiState.value = _uiState.value.copy(
                            progress = progress,
                            status = when {
                                progress < 70 -> DownloadStatus.DOWNLOADING
                                progress < 90 -> DownloadStatus.DECRYPTING
                                else -> DownloadStatus.DOWNLOADING
                            }
                        )
                    }
                )

                if (result.success) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        progress = 100,
                        status = DownloadStatus.COMPLETED,
                        downloadedFilePath = result.localPath,
                        isSuccess = true
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        progress = 0,
                        status = DownloadStatus.FAILED,
                        error = result.error ?: "Download failed"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    progress = 0,
                    status = DownloadStatus.FAILED,
                    error = "Download error: ${e.message}"
                )
            }
        }
    }

    fun verifyFile(rootHash: String, networkType: String = "standard") {
        viewModelScope.launch {
            try {
                val exists = downloadManager.verifyFileExists(rootHash, networkType)
                if (!exists) {
                    _uiState.value = _uiState.value.copy(
                        error = "File not found in 0G Storage"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = "Verification failed: ${e.message}"
                )
            }
        }
    }

    fun getDownloadedFiles() = downloadManager.getDownloadedFiles()

    fun deleteDownloadedFile(filePath: String): Boolean {
        return downloadManager.deleteDownloadedFile(filePath)
    }

    fun clearAllDownloads(): Boolean {
        return downloadManager.clearAllDownloads()
    }

    fun getDownloadedFilesSize(): Long {
        return downloadManager.getDownloadedFilesSize()
    }

    fun clearState() {
        _uiState.value = DownloadUiState()
    }
}