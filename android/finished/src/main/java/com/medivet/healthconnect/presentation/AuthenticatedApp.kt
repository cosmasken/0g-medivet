package com.medivet.healthconnect.presentation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.medivet.healthconnect.data.HealthConnectManager
import com.medivet.healthconnect.presentation.navigation.Screen
import com.medivet.healthconnect.presentation.screen.login.LoginScreen
import com.medivet.healthconnect.presentation.screen.login.RegisterScreen

@Composable
fun AuthenticatedApp(healthConnectManager: HealthConnectManager) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.WelcomeScreen.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(Screen.Register.route)
                }
            )
        }
        composable(Screen.Register.route) {
            RegisterScreen(
                onRegistrationSuccess = {
                    navController.navigate(Screen.WelcomeScreen.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.WelcomeScreen.route) {
            HealthConnectApp(healthConnectManager = healthConnectManager)
        }
    }
}