package com.medivet.healthconnect.presentation.screen.login

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.AuthRepository
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.launch

class RegisterViewModel(
    private val authRepository: AuthRepository,
    private val sharedPreferencesHelper: SharedPreferencesHelper
) : ViewModel() {

    val registrationState = mutableStateOf<RegistrationState>(RegistrationState.Idle)

    fun register(username: String, walletAddress: String, role: String) {
        viewModelScope.launch {
            registrationState.value = RegistrationState.Loading
            try {
                val authResponse = authRepository.auth(walletAddress, username, role)
                sharedPreferencesHelper.setUserInfo(authResponse.user.id, authResponse.user.username, authResponse.user.walletAddress)
                sharedPreferencesHelper.setIsLoggedIn(true)
                registrationState.value = RegistrationState.Success
            } catch (e: Exception) {
                registrationState.value = RegistrationState.Error(e.message ?: "An unexpected error occurred")
            }
        }
    }
}

sealed class RegistrationState {
    object Idle : RegistrationState()
    object Loading : RegistrationState()
    object Success : RegistrationState()
    data class Error(val message: String) : RegistrationState()
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