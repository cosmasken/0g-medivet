package com.medivet.healthconnect.data

import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.api.model.AuthRequest
import com.medivet.healthconnect.data.api.model.CredentialAuthRequest
import com.medivet.healthconnect.data.api.model.UserResponse
import com.medivet.healthconnect.data.repository.MediVetRepository

class AuthRepository {

    private val repository = MediVetRepository(NetworkClient.apiService)

    suspend fun auth(walletAddress: String, username: String, role: String): UserResponse {
        val request = AuthRequest(walletAddress)
        return repository.authenticateUser(request).body() ?: 
            throw Exception("Authentication failed")
    }

    suspend fun loginWithCredentials(
        username: String, 
        password: String, 
        role: String = "patient"
    ): UserResponse {
        val request = CredentialAuthRequest(username, password)
        val response = repository.authenticateWithCredentials(request)
        return if (response.isSuccessful) {
            response.body() ?: throw Exception("Authentication failed")
        } else {
            val errorMessage = when (response.code()) {
                400 -> "Invalid request. Please check your credentials."
                401 -> "Authentication failed. Invalid username or password."
                404 -> "User not found. Please register first."
                409 -> {
                    // Handle the specific case of duplicate username
                    val errorBody = response.errorBody()?.string()
                    if (errorBody?.contains("already exists") == true) {
                        "Username already exists. Please try a different username."
                    } else {
                        "Conflict: ${errorBody ?: "Username conflict"}"
                    }
                }
                422 -> "Unprocessable entity. Please check your input."
                500 -> "Server error. Please try again later."
                else -> "Login failed: ${response.code()} - ${response.message()}"
            }
            throw Exception(errorMessage)
        }
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