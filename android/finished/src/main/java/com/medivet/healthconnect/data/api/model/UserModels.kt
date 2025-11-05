package com.medivet.healthconnect.data.api.model

import com.google.gson.annotations.SerializedName

// Request models
data class AuthRequest(
    @SerializedName("wallet_address") val walletAddress: String,
    val role: String = "patient",
    val username: String
)

// Mobile authentication with username/password
data class CredentialAuthRequest(
    val username: String,
    val password: String,
    val role: String = "patient"
)

data class LoginRequest(
    @SerializedName("wallet_address") val walletAddress: String,
    val username: String
)

// Response models
data class UserResponse(
    val user: User,
    @SerializedName("wallet_address") val walletAddress: String? = null,
    @SerializedName("auth_method") val authMethod: String? = null,
    @SerializedName("is_new_user") val isNewUser: Boolean = false,
    val message: String? = null
)

data class UsernameCheckResponse(
    val available: Boolean,
    val username: String
)

data class User(
    val id: String,
    @SerializedName("wallet_address") val walletAddress: String,
    val username: String,
    val role: String,
    @SerializedName("is_onboarded") val isOnboarded: Boolean,
    @SerializedName("created_at") val createdAt: String
)

data class LoginResponse(
    val user: User
)

data class HealthCheckResponse(
    val status: String,
    val timestamp: String,
    val services: Services
)

data class Services(
    val database: String,
    val supabase: String,
    val compute: String
)