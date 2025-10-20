package com.medivet.healthconnect.data

import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.api.model.AuthRequest
import com.medivet.healthconnect.data.api.model.CredentialAuthRequest
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

    suspend fun loginWithCredentials(username: String, password: String, role: String = "patient"): UserResponse {
        val request = CredentialAuthRequest(username, password, role)
        val response = repository.authenticateWithCredentials(request)
        if (response.isSuccessful) {
            return response.body() ?: throw Exception("Authentication failed")
        } else {
            val errorMessage = when (response.code()) {
                400 -> "Invalid username or password"
                401 -> "Authentication failed"
                404 -> "User not found"
                500 -> "Server error. Please try again later"
                else -> "Login failed. Please try again"
            }
            throw Exception(errorMessage)
        }
    }

    suspend fun login(walletAddress: String, username: String): LoginResponse {
        val request = LoginRequest(username, walletAddress)
        return repository.loginUser(request).body() ?: throw Exception("Login failed")
    }

    suspend fun checkUsernameAvailability(username: String): Boolean {
        val response = repository.checkUsername(username)
        return if (response.isSuccessful) {
            response.body()?.available ?: false
        } else {
            false
        }
    }
}