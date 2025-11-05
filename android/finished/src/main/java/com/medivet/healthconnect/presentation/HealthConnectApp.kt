/*
 * Copyright 2022 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.medivet.healthconnect.presentation

import android.annotation.SuppressLint
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.Scaffold
import androidx.compose.material.Snackbar
import androidx.compose.material.SnackbarHost
import androidx.compose.material.Text
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.rememberScaffoldState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.medivet.healthconnect.R
import com.medivet.healthconnect.data.HealthConnectAvailability
import com.medivet.healthconnect.data.HealthConnectManager
import com.medivet.healthconnect.presentation.navigation.Drawer
import com.medivet.healthconnect.presentation.navigation.HealthConnectNavigation
import com.medivet.healthconnect.presentation.navigation.MediVetBottomNavigation
import com.medivet.healthconnect.presentation.navigation.Screen
import com.medivet.healthconnect.presentation.screen.auth.LoginScreen
import com.medivet.healthconnect.presentation.screen.auth.RegisterScreen
import com.medivet.healthconnect.presentation.theme.HealthConnectTheme
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.launch

const val TAG = "MediVet"

@SuppressLint("UnusedMaterialScaffoldPaddingParameter")
@Composable
fun HealthConnectApp(healthConnectManager: HealthConnectManager) {
    val context = LocalContext.current
    val sharedPreferencesHelper = SharedPreferencesHelper.getInstance(context)
    
    // Check if user is authenticated
    val isAuthenticated = sharedPreferencesHelper.isLoggedIn()
    
    if (isAuthenticated) {
        ShowMainApp(healthConnectManager)
    } else {
        ShowAuthFlow()
    }
}

@Composable
fun ShowAuthFlow() {
    HealthConnectTheme {
        val navController = rememberNavController()
        NavHost(navController = navController, startDestination = "login") {
            composable("login") {
                LoginScreen(
                    onLoginSuccess = { 
                        // Authentication successful - the parent composable will recompose
                        // and show the main app due to the authentication check
                    },
                    onNavigateToRegister = { navController.navigate("register") }
                )
            }
            composable("register") {
                RegisterScreen(
                    onRegisterSuccess = { 
                        // Registration successful - navigate back to login or auto-login
                        navController.popBackStack()
                    },
                    onNavigateToLogin = { navController.popBackStack() }
                )
            }
        }
    }
}

@Composable
fun ShowMainApp(healthConnectManager: HealthConnectManager) {
    HealthConnectTheme {
        val scaffoldState = rememberScaffoldState()
        val navController = rememberNavController()
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentRoute = navBackStackEntry?.destination?.route

        // Check if current route should show bottom navigation
        val showBottomNav = listOf(
            Screen.Dashboard.route,
            Screen.Files.route,
            Screen.Analysis.route,
            Screen.Profile.route
        ).contains(currentRoute)

        Scaffold(
            scaffoldState = scaffoldState,
            topBar = {
                TopAppBar(
                    title = {
                        val titleId = when (currentRoute) {
                            Screen.Dashboard.route -> Screen.Dashboard.titleId
                            Screen.Files.route -> Screen.Files.titleId
                            Screen.Analysis.route -> Screen.Analysis.titleId
                            Screen.Profile.route -> Screen.Profile.titleId
                            Screen.ExerciseSessions.route -> Screen.ExerciseSessions.titleId
                            Screen.InputReadings.route -> Screen.InputReadings.titleId
                            Screen.DifferentialChanges.route -> Screen.DifferentialChanges.titleId
                            Screen.MedicalRecords.route -> Screen.MedicalRecords.titleId
                            else -> R.string.app_name
                        }
                        Text(stringResource(titleId))
                    }
                )
            },
            bottomBar = {
                if (showBottomNav) {
                    MediVetBottomNavigation(navController = navController)
                }
            },
            snackbarHost = { snackbarHostState ->
                SnackbarHost(snackbarHostState) { data -> Snackbar(snackbarData = data) }
            }
        ) {
            HealthConnectNavigation(
                healthConnectManager = healthConnectManager,
                navController = navController,
                scaffoldState = scaffoldState
            )
        }
    }
}
