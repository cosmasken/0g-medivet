package com.medivet.healthconnect.presentation.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.api.NetworkClient
import com.medivet.healthconnect.data.api.model.AuthRequest
import com.medivet.healthconnect.data.api.model.CredentialAuthRequest
import com.medivet.healthconnect.data.api.model.User
import com.medivet.healthconnect.data.repository.MediVetRepository
import com.medivet.healthconnect.data.wallet.TransactionManager
import com.medivet.healthconnect.util.CryptoUtils
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val isAuthenticated: Boolean = false,
    val isWalletInitialized: Boolean = false
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = MediVetRepository(NetworkClient.apiService)
    private val sharedPreferencesHelper = SharedPreferencesHelper.getInstance(application)
    private val transactionManager = TransactionManager(application)

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    init {
        // Check if user is already logged in from shared preferences
        if (sharedPreferencesHelper.isLoggedIn()) {
            val (userId, username, walletAddress) = sharedPreferencesHelper.getUserInfo()
            if (userId != null && username != null && walletAddress != null) {
                _uiState.value = AuthUiState(
                    isAuthenticated = true,
                    user = User(userId, walletAddress, username, "patient", true, ""),
                    isWalletInitialized = transactionManager.isWalletReady()
                )
            }
        }
    }

    fun login(username: String, password: String) {
        Log.d("AuthViewModel", "Starting login for username: $username")
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                Log.d("AuthViewModel", "Making API call for login")
                val response = repository.authenticateWithCredentials(
                    CredentialAuthRequest(username, password, "patient")
                )

                if (response.isSuccessful && response.body() != null) {
                    Log.d("AuthViewModel", "Login successful for user: ${response.body()!!.user.username}")
                    val user = response.body()!!.user
                    handleSuccessfulAuth(user, username, password)
                } else {
                    Log.e("AuthViewModel", "Login failed with code: ${response.code()}")
                    handleApiError(response.code(), "Invalid username or password.")
                }
            } catch (e: Exception) {
                Log.e("AuthViewModel", "Login exception: ${e.message}", e)
                handleException(e)
            }
        }
    }

    fun register(username: String, password: String) {
        Log.d("AuthViewModel", "Starting registration for username: $username")
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                Log.d("AuthViewModel", "Generating wallet address for registration")
                val walletAddress = CryptoUtils.generateAddressFromCredentials(username, password)
                Log.d("AuthViewModel", "Generated wallet address: $walletAddress")
                val request = AuthRequest(walletAddress, "patient", username)
                Log.d("AuthViewModel", "Making API call for registration")
                val response = repository.authenticateUser(request)

                if (response.isSuccessful && response.body() != null) {
                    Log.d("AuthViewModel", "Registration successful for user: ${response.body()!!.user.username}")
                    val user = response.body()!!.user
                    handleSuccessfulAuth(user, username, password)
                } else {
                    Log.e("AuthViewModel", "Registration failed with code: ${response.code()}")
                    handleApiError(response.code(), "A user with this username already exists.")
                }
            } catch (e: Exception) {
                Log.e("AuthViewModel", "Registration exception: ${e.message}", e)
                handleException(e)
            }
        }
    }

    private suspend fun handleSuccessfulAuth(user: User, username: String, password: String) {
        try {
            // Initialize wallet for transaction signing
            transactionManager.initialize(username, password)
            
            // Save user info to shared preferences
            sharedPreferencesHelper.setIsLoggedIn(true)
            sharedPreferencesHelper.setUserInfo(user.id, user.username, user.walletAddress)
            
            _uiState.value = AuthUiState(
                isAuthenticated = true, 
                user = user,
                isWalletInitialized = true
            )
        } catch (e: Exception) {
            // Authentication succeeded but wallet initialization failed
            sharedPreferencesHelper.setIsLoggedIn(true)
            sharedPreferencesHelper.setUserInfo(user.id, user.username, user.walletAddress)
            
            _uiState.value = AuthUiState(
                isAuthenticated = true, 
                user = user,
                isWalletInitialized = false,
                error = "Wallet initialization failed: ${e.message}"
            )
        }
    }

    /**
     * Initialize wallet for existing authenticated user.
     * This can be called if wallet initialization failed during login.
     */
    fun initializeWallet(username: String, password: String) {
        viewModelScope.launch {
            try {
                transactionManager.initialize(username, password)
                _uiState.value = _uiState.value.copy(
                    isWalletInitialized = true,
                    error = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = "Wallet initialization failed: ${e.message}"
                )
            }
        }
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
        transactionManager.clearWallet()
        sharedPreferencesHelper.clearUserInfo()
        _uiState.value = AuthUiState()
    }
}
