package com.medivet.healthconnect.presentation.navigation

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.material.ScaffoldState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import com.medivet.healthconnect.data.AuthRepository
import com.medivet.healthconnect.data.HealthConnectManager
import kotlinx.coroutines.launch
import com.medivet.healthconnect.presentation.screen.WelcomeScreen
import com.medivet.healthconnect.presentation.screen.exercisesession.ExerciseSessionScreen
import com.medivet.healthconnect.presentation.screen.exercisesession.ExerciseSessionViewModel
import com.medivet.healthconnect.presentation.screen.exercisesession.ExerciseSessionViewModelFactory
import com.medivet.healthconnect.presentation.screen.login.LoginScreen
import com.medivet.healthconnect.presentation.screen.login.LoginViewModelFactory
import com.medivet.healthconnect.presentation.screen.login.RegisterScreen
import com.medivet.healthconnect.presentation.screen.login.RegisterViewModelFactory

const val UID_NAV_ARGUMENT = "uid"

@Composable
fun HealthConnectNavigation(
    navController: NavHostController,
    healthConnectManager: HealthConnectManager,
    scaffoldState: ScaffoldState,
) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val sharedPreferencesHelper = (context.applicationContext as com.medivet.healthconnect.presentation.BaseApplication).sharedPreferencesHelper
    val authRepository = AuthRepository()

    val startDestination = if (sharedPreferencesHelper.isLoggedIn()) Screen.ExerciseSessions.route else "auth"

    NavHost(navController = navController, startDestination = startDestination) {
        navigation(startDestination = Screen.Login.route, route = "auth") {
            composable(Screen.Login.route) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.ExerciseSessions.route) {
                            popUpTo("auth") { inclusive = true }
                        }
                    },
                    onNavigateToRegister = {
                        navController.navigate(Screen.Register.route)
                    },
                    viewModel = viewModel(
                        factory = LoginViewModelFactory(authRepository, sharedPreferencesHelper)
                    )
                )
            }
            composable(Screen.Register.route) {
                RegisterScreen(
                    onRegistrationSuccess = {
                        navController.navigate(Screen.ExerciseSessions.route) {
                            popUpTo("auth") { inclusive = true }
                        }
                    },
                    viewModel = viewModel(
                        factory = RegisterViewModelFactory(authRepository, sharedPreferencesHelper)
                    )
                )
            }
        }
        composable(Screen.WelcomeScreen.route) {
            val healthConnectAvailability by healthConnectManager.availability
            WelcomeScreen(
                healthConnectAvailability = healthConnectAvailability,
                onResumeAvailabilityCheck = {
                    healthConnectManager.checkAvailability()
                }
            )
        }
        composable(Screen.ExerciseSessions.route) {
            val viewModel: ExerciseSessionViewModel = viewModel(
                factory = ExerciseSessionViewModelFactory(
                    healthConnectManager = healthConnectManager
                )
            )
            val permissionsGranted = viewModel.permissionsGranted.value
            val sessionsList = viewModel.sessionsList.value
            val uiState = viewModel.uiState
            val launcher = rememberLauncherForActivityResult(viewModel.permissionsLauncher) {
                viewModel.initialLoad()
            }

            ExerciseSessionScreen(
                permissionsGranted = permissionsGranted,
                permissions = viewModel.permissions,
                sessionsList = sessionsList,
                uiState = uiState,
                onInsertClick = {
                    viewModel.insertExerciseSession()
                },
                onDetailsClick = { uid ->
                    navController.navigate(Screen.ExerciseSessionDetail.route + "/" + uid)
                },
                onError = { exception ->
                    scope.launch {
                        scaffoldState.snackbarHostState.showSnackbar(
                            message = exception?.localizedMessage ?: "An error occurred"
                        )
                    }
                },
                onPermissionsResult = {
                    viewModel.initialLoad()
                },
                onPermissionsLaunch = { values ->
                    launcher.launch(values)
                },
                onLogoutClick = {
                    sharedPreferencesHelper.clearUserInfo()
                    navController.navigate("auth") {
                        popUpTo(Screen.ExerciseSessions.route) { inclusive = true }
                    }
                }
            )
        }
    }
}
