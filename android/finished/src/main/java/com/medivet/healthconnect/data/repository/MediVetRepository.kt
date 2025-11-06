package com.medivet.healthconnect.data.repository

import com.medivet.healthconnect.data.api.model.AuthRequest


import com.medivet.healthconnect.data.api.model.CreateRecordRequest
import com.medivet.healthconnect.data.api.model.CredentialAuthRequest
import com.medivet.healthconnect.data.api.model.LoginRequest
import com.medivet.healthconnect.data.api.model.SyncHealthDataRequest
import com.medivet.healthconnect.data.api.service.MediVetApiService

class MediVetRepository(private val apiService: MediVetApiService) {

    // User management
    suspend fun authenticateUser(request: AuthRequest) = apiService.authenticateUser(request)
    suspend fun authenticateWithCredentials(request: CredentialAuthRequest) = apiService.authenticateWithCredentials(request)
    suspend fun checkUsername(username: String) = apiService.checkUsername(username)

    // Medical records
    suspend fun createMedicalRecord(request: CreateRecordRequest) = apiService.createMedicalRecord(request)
    suspend fun getUserRecords(userId: String) = apiService.getUserRecords(userId)
    suspend fun uploadFile(metadata: okhttp3.RequestBody, file: okhttp3.MultipartBody.Part) = 
        apiService.uploadFile(metadata, file)

    // Health Connect
    suspend fun syncHealthData(request: SyncHealthDataRequest) = apiService.syncHealthData(request)
    suspend fun getHealthData(userId: String) = apiService.getHealthData(userId)
    suspend fun getHealthStats(userId: String) = apiService.getHealthStats(userId)

    // Compute
    
}