package com.medivet.healthconnect.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.api.model.ComputeAnalysisRequest
import com.medivet.healthconnect.data.api.model.ComputeAnalysisResponse
import com.medivet.healthconnect.data.repository.MediVetRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ComputeUiState(
    val isLoading: Boolean = false,
    val analysisResult: ComputeAnalysisResponse? = null,
    val error: String? = null
)

class ComputeViewModel : ViewModel() {
    private val repository = MediVetRepository(NetworkClient.apiService)

    private val _uiState = MutableStateFlow(ComputeUiState())
    val uiState: StateFlow<ComputeUiState> = _uiState

    fun analyzeMedicalData(request: ComputeAnalysisRequest) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                val response = repository.analyzeMedicalData(request)

                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        analysisResult = response.body()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = response.message() ?: "Analysis failed"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "An error occurred during analysis"
                )
            }
        }
    }
}