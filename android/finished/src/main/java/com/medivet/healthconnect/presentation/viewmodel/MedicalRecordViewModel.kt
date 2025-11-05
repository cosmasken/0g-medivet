package com.medivet.healthconnect.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.api.model.CreateRecordRequest
import com.medivet.healthconnect.data.api.model.MedicalRecord
import com.medivet.healthconnect.data.repository.MediVetRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class MedicalRecordUiState(
    val isLoading: Boolean = false,
    val medicalRecords: List<MedicalRecord> = emptyList(),
    val selectedRecord: MedicalRecord? = null,
    val error: String? = null
)

class MedicalRecordViewModel : ViewModel() {
    private val repository = MediVetRepository(NetworkClient.apiService)
    
    private val _uiState = MutableStateFlow(MedicalRecordUiState())
    val uiState: StateFlow<MedicalRecordUiState> = _uiState

    fun getMedicalRecords(userId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val response = repository.getUserRecords(userId)
                
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        medicalRecords = response.body()?.records ?: emptyList()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = response.message() ?: "Failed to fetch records"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "An error occurred"
                )
            }
        }
    }

    fun createMedicalRecord(request: CreateRecordRequest) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val response = repository.createMedicalRecord(request)
                
                if (response.isSuccessful) {
                    // Refresh the list of records
                    response.body()?.let { newRecord ->
                        val updatedRecords = _uiState.value.medicalRecords + newRecord
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            medicalRecords = updatedRecords
                        )
                    }
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = response.message() ?: "Failed to create record"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "An error occurred"
                )
            }
        }
    }
    
    fun selectRecord(record: MedicalRecord) {
        _uiState.value = _uiState.value.copy(selectedRecord = record)
    }
}