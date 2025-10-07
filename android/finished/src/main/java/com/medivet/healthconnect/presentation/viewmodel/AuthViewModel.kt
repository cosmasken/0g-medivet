package com.medivet.healthconnect.presentation.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.api.model.AuthRequest
import com.medivet.healthconnect.data.api.model.LoginRequest
import com.medivet.healthconnect.data.api.model.User
import com.medivet.healthconnect.data.repository.MediVetRepository
import com.medivet.healthconnect.util.CryptoUtils
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val isAuthenticated: Boolean = false
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = MediVetRepository(NetworkClient.apiService)
    private val sharedPreferencesHelper = SharedPreferencesHelper.getInstance(application)

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    init {
        // Check if user is already logged in from shared preferences
        if (sharedPreferencesHelper.isLoggedIn()) {
            val (userId, username, walletAddress) = sharedPreferencesHelper.getUserInfo()
            if (userId != null && username != null && walletAddress != null) {
                _uiState.value = AuthUiState(
                    isAuthenticated = true,
                    user = User(userId, walletAddress, username, "patient", true, "")
                )
            }
        }
    }

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val walletAddress = CryptoUtils.generateAddressFromCredentials(username, password)
                val request = LoginRequest(walletAddress = walletAddress, username = username)
                val response = repository.loginUser(request)

                if (response.isSuccessful && response.body() != null) {
                    val user = response.body()!!.user
                    handleSuccessfulAuth(user)
                } else {
                    handleApiError(response.code(), "Invalid username or password.")
                }
            } catch (e: Exception) {
                handleException(e)
            }
        }
    }

    fun register(username: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val walletAddress = CryptoUtils.generateAddressFromCredentials(username, password)
                val request = AuthRequest(walletAddress = walletAddress, username = username)
                val response = repository.authenticateUser(request)

                if (response.isSuccessful && response.body() != null) {
                    val user = response.body()!!.user
                    handleSuccessfulAuth(user)
                } else {
                    handleApiError(response.code(), "A user with this username already exists.")
                }
            } catch (e: Exception) {
                handleException(e)
            }
        }
    }

    private fun handleSuccessfulAuth(user: User) {
        sharedPreferencesHelper.setIsLoggedIn(true)
        sharedPreferencesHelper.setUserInfo(user.id, user.username, user.walletAddress)
        _uiState.value = AuthUiState(isAuthenticated = true, user = user)
    }

    private fun handleApiError(code: Int, defaultMessage: String) {
        val errorMessage = when (code) {
            401, 404 -> defaultMessage
            409 -> "This username is already taken. Please try another one."
            429 -> "Too many requests. Please try again later."
            in 500..599 -> "Server error. Please try again later."
            else -> "An unknown error occurred (Code: $code)"
        }
        _uiState.value = _uiState.value.copy(isLoading = false, error = errorMessage)
    }

    private fun handleException(e: Exception) {
        val errorMessage = when {
            e.message?.contains("timeout", ignoreCase = true) == true ->
                "Connection timeout. Please check your internet connection."
            e.message?.contains("failed to connect", ignoreCase = true) == true ->
                "Failed to connect to server. Please try again later."
            else -> e.message ?: "An unexpected error occurred"
        }
        _uiState.value = _uiState.value.copy(isLoading = false, error = errorMessage)
    }

    fun logout() {
        sharedPreferencesHelper.clearUserInfo()
        _uiState.value = AuthUiState()
    }
}
