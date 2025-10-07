package com.medivet.healthconnect.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.HealthConnectManager
import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.api.model.HealthDataPoint
import com.medivet.healthconnect.data.api.model.SyncHealthDataRequest
import com.medivet.healthconnect.data.repository.MediVetRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.time.temporal.ChronoUnit

data class HealthSyncUiState(
    val isSyncing: Boolean = false,
    val syncProgress: Float = 0f,
    val syncMessage: String = "",
    val lastSyncTime: String? = null,
    val error: String? = null
)

class HealthSyncViewModel : ViewModel() {
    private val repository = MediVetRepository(NetworkClient.apiService)

    private val _uiState = MutableStateFlow(HealthSyncUiState())
    val uiState: StateFlow<HealthSyncUiState> = _uiState

    fun syncHealthDataToBackend(userId: String, healthConnectManager: HealthConnectManager) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSyncing = true, error = null, syncMessage = "Starting sync...")

            try {
                // Use the new HealthConnectManager sync method
                val now = java.time.Instant.now()
                val oneWeekAgo = now.minus(7, java.time.temporal.ChronoUnit.DAYS)
                
                val success = healthConnectManager.syncHealthDataToBackend(userId, oneWeekAgo, now)

                if (success) {
                    _uiState.value = _uiState.value.copy(
                        isSyncing = false,
                        syncMessage = "Successfully synced health data to backend",
                        lastSyncTime = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date()),
                        syncProgress = 1f
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isSyncing = false,
                        error = "Sync failed"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSyncing = false,
                    error = e.message ?: "An error occurred during sync"
                )
            }
        }
    }

    private suspend fun getHealthDataFromHealthConnect(healthConnectManager: HealthConnectManager): List<HealthDataPoint> {
        val healthDataPoints = mutableListOf<HealthDataPoint>()

        try {
            // Get exercise sessions
            val now = java.time.Instant.now()
            val oneWeekAgo = now.minus(7, ChronoUnit.DAYS)

            val exerciseSessions = healthConnectManager.readExerciseSessions(oneWeekAgo, now)
            for (session in exerciseSessions) {
                healthDataPoints.add(
                    HealthDataPoint(
                        dataType = "exercise_session",
                        startTime = session.startTime.toString(),
                        endTime = session.endTime.toString(),
                        value = mapOf(
                            "title" to (session.title ?: "Exercise Session"),
                            "type" to session.exerciseType
                        ),
                        unit = "",
                        sourceApp = "Health Connect",
                        sourceDevice = "Android Device",
                        metadata = mapOf(
                            "uid" to session.metadata.id
                        )
                    )
                )
            }

            // Get weight records
            val weightRecords = healthConnectManager.readWeightInputs(oneWeekAgo, now)
            for (weight in weightRecords) {
                healthDataPoints.add(
                    HealthDataPoint(
                        dataType = "weight",
                        startTime = weight.time.toString(),
                        endTime = weight.time.toString(),
                        value = weight.weight.inKilograms,
                        unit = "kg",
                        sourceApp = "Health Connect",
                        sourceDevice = "Android Device",
                        metadata = mapOf(
                            "zone_offset" to weight.zoneOffset.toString()
                        )
                    )
                )
            }

            // Add more health data types as needed

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return healthDataPoints
    }

    fun getHealthStats(userId: String) {
        viewModelScope.launch {
            try {
                val response = repository.getHealthStats(userId)
                // Handle the stats response as needed
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(error = e.message ?: "Error fetching health stats")
            }
        }
    }
}