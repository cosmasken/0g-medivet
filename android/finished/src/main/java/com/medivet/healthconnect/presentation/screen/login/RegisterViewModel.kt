package com.medivet.healthconnect.presentation.screen.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.AuthRepository
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RegisterViewModel(
    private val authRepository: AuthRepository,
    private val sharedPreferencesHelper: SharedPreferencesHelper
) : ViewModel() {

    private val _registerState = MutableStateFlow<RegisterState>(RegisterState.Idle)
    val registerState: StateFlow<RegisterState> = _registerState.asStateFlow()

    fun register(username: String, password: String, confirmPassword: String) {
        viewModelScope.launch {
            _registerState.value = RegisterState.Loading
            
            try {
                // Validate input
                if (username.length < 3) {
                    _registerState.value = RegisterState.Error("Username must be at least 3 characters")
                    return@launch
                }
                
                if (password.length < 6) {
                    _registerState.value = RegisterState.Error("Password must be at least 6 characters")
                    return@launch
                }
                
                if (password != confirmPassword) {
                    _registerState.value = RegisterState.Error("Passwords do not match")
                    return@launch
                }

                // Check username availability
                val isAvailable = authRepository.checkUsernameAvailability(username.trim())
                if (!isAvailable) {
                    _registerState.value = RegisterState.Error("Username is already taken")
                    return@launch
                }

                // Register user
                val authResponse = authRepository.loginWithCredentials(username.trim(), password)
                
                // Save user data
                sharedPreferencesHelper.setUserInfo(
                    authResponse.user.id,
                    authResponse.user.username,
                    authResponse.walletAddress ?: ""
                )
                sharedPreferencesHelper.setIsLoggedIn(true)
                
                _registerState.value = RegisterState.Success("Account created successfully")
                
            } catch (e: Exception) {
                _registerState.value = RegisterState.Error(
                    e.message ?: "Registration failed"
                )
            }
        }
    }

    fun resetState() {
        _registerState.value = RegisterState.Idle
    }
}

sealed class RegisterState {
    object Idle : RegisterState()
    object Loading : RegisterState()
    data class Success(val message: String) : RegisterState()
    data class Error(val message: String) : RegisterState()
}

class RegisterViewModelFactory(
    private val authRepository: AuthRepository,
    private val sharedPreferencesHelper: SharedPreferencesHelper
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(RegisterViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return RegisterViewModel(authRepository, sharedPreferencesHelper) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}