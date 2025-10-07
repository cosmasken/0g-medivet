package com.medivet.healthconnect.data

import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.api.model.AuthRequest
import com.medivet.healthconnect.data.api.model.LoginRequest
import com.medivet.healthconnect.data.api.model.LoginResponse
import com.medivet.healthconnect.data.api.model.UserResponse
import com.medivet.healthconnect.data.repository.MediVetRepository

class AuthRepository {

    private val repository = MediVetRepository(NetworkClient.apiService)

    suspend fun auth(walletAddress: String, username: String, role: String): UserResponse {
        val request = AuthRequest(walletAddress, role, username)
        return repository.authenticateUser(request).body() ?: throw Exception("Authentication failed")
    }

    suspend fun login(walletAddress: String, username: String): LoginResponse {
        val request = LoginRequest(username, walletAddress)
        return repository.loginUser(request).body() ?: throw Exception("Login failed")
    }
}