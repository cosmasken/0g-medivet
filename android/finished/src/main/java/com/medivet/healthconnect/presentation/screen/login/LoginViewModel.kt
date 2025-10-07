package com.medivet.healthconnect.presentation.screen.login

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.AuthRepository
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.launch

class LoginViewModel(
    private val authRepository: AuthRepository,
    private val sharedPreferencesHelper: SharedPreferencesHelper
) : ViewModel() {

    val loginState = mutableStateOf<LoginState>(LoginState.Idle)

    fun login(username: String, walletAddress: String) {
        viewModelScope.launch {
            loginState.value = LoginState.Loading
            try {
                val authResponse = authRepository.login(walletAddress, username)
                sharedPreferencesHelper.setUserInfo(authResponse.user.id, authResponse.user.username, authResponse.user.walletAddress)
                sharedPreferencesHelper.setIsLoggedIn(true)
                loginState.value = LoginState.Success
            } catch (e: Exception) {
                loginState.value = LoginState.Error(e.message ?: "An unexpected error occurred")
            }
        }
    }
}

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    object Success : LoginState()
    data class Error(val message: String) : LoginState()
}

class LoginViewModelFactory(
    private val authRepository: AuthRepository,
    private val sharedPreferencesHelper: SharedPreferencesHelper
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(LoginViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return LoginViewModel(authRepository, sharedPreferencesHelper) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}