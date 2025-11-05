package com.medivet.healthconnect.presentation.navigation

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import com.medivet.healthconnect.data.AuthRepository
import com.medivet.healthconnect.data.HealthConnectManager
import kotlinx.coroutines.launch
import com.medivet.healthconnect.presentation.screen.WelcomeScreen
import com.medivet.healthconnect.presentation.screen.dashboard.DashboardScreen
import com.medivet.healthconnect.presentation.screen.files.FilesScreen
import com.medivet.healthconnect.presentation.screen.files.AllFilesScreen
import com.medivet.healthconnect.presentation.screen.files.FileDetailScreen
import com.medivet.healthconnect.presentation.screen.files.UploadFileScreen
import com.medivet.healthconnect.presentation.screen.files.DownloadFileScreen
import com.medivet.healthconnect.presentation.screen.files.ShareFileScreen
import com.medivet.healthconnect.presentation.screen.analysis.AnalysisScreen
import com.medivet.healthconnect.presentation.screen.analysis.GenerateAnalysisScreen
import com.medivet.healthconnect.presentation.screen.profile.ProfileScreen
import com.medivet.healthconnect.presentation.screen.profile.PersonalDetailsScreen
import com.medivet.healthconnect.presentation.screen.profile.ExportDataScreen
import com.medivet.healthconnect.presentation.screen.profile.DataSyncScreen
import com.medivet.healthconnect.presentation.screen.profile.NotificationsScreen
import com.medivet.healthconnect.presentation.screen.profile.BlockchainWalletScreen
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

    // Temporarily bypass authentication - go directly to Dashboard for screenshots
    val startDestination = Screen.Dashboard.route

    NavHost(navController = navController, startDestination = startDestination) {
        navigation(startDestination = Screen.Login.route, route = "auth") {
            composable(Screen.Login.route) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
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
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo("auth") { inclusive = true }
                        }
                    },
                    viewModel = viewModel(
                        factory = RegisterViewModelFactory(authRepository, sharedPreferencesHelper)
                    )
                )
            }
        }
        
        // Main MediVet screens
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onViewAllFiles = { navController.navigate(Screen.AllFiles.route) },
                onFileClick = { fileId -> navController.navigate("${Screen.FileDetail.route}/$fileId") }
            )
        }
        
        composable(Screen.Files.route) {
            FilesScreen(
                onUploadFile = { navController.navigate(Screen.UploadFile.route) },
                onFileClick = { fileId -> navController.navigate("${Screen.FileDetail.route}/$fileId") },
                onAnalyzeClick = { fileId -> navController.navigate("${Screen.AnalysisDetail.route}/$fileId") }
            )
        }
        
        composable(Screen.Analysis.route) {
            AnalysisScreen(
                onGenerateAnalysis = { navController.navigate(Screen.GenerateAnalysis.route) }
            )
        }
        
        composable(Screen.Profile.route) {
            ProfileScreen(
                onLogout = {
                    sharedPreferencesHelper.clearUserInfo()
                    navController.navigate("auth") {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                },
                onPersonalDetails = { navController.navigate(Screen.PersonalDetails.route) },
                onMedicalHistory = { navController.navigate(Screen.MedicalHistory.route) },
                onDataPermissions = { navController.navigate(Screen.DataPermissions.route) },
                onExportData = { navController.navigate(Screen.ExportData.route) },
                onDataSync = { navController.navigate(Screen.DataSync.route) },
                onNotifications = { navController.navigate(Screen.Notifications.route) },
                onBlockchainWallet = { navController.navigate(Screen.BlockchainWallet.route) },
                onSharingSettings = { navController.navigate(Screen.SharingSettings.route) },
                onPrivacyPolicy = { navController.navigate(Screen.PrivacyPolicyDetail.route) }
            )
        }
        
        composable(Screen.Wallet.route) {
            com.medivet.healthconnect.presentation.screen.wallet.WalletScreen()
        }
        
        // Sub-pages
        composable(Screen.AllFiles.route) {
            AllFilesScreen(
                onFileClick = { fileId -> navController.navigate("${Screen.FileDetail.route}/$fileId") },
                onAnalyzeClick = { fileId -> navController.navigate("${Screen.AnalysisDetail.route}/$fileId") },
                onUploadFile = { navController.navigate(Screen.UploadFile.route) }
            )
        }
        
        composable("${Screen.FileDetail.route}/{fileId}") { backStackEntry ->
            val fileId = backStackEntry.arguments?.getString("fileId") ?: "1"
            FileDetailScreen(
                fileId = fileId,
                onAnalyzeClick = { navController.navigate("${Screen.AnalysisDetail.route}/$fileId") },
                onDownloadClick = { navController.navigate("${Screen.DownloadFile.route}/$fileId") },
                onShareClick = { navController.navigate("${Screen.ShareFile.route}/$fileId") }
            )
        }
        
        composable(Screen.UploadFile.route) {
            UploadFileScreen(
                onUploadComplete = { navController.popBackStack() }
            )
        }
        
        composable(Screen.GenerateAnalysis.route) {
            GenerateAnalysisScreen(
                onAnalysisComplete = { navController.popBackStack() }
            )
        }
        
        composable("${Screen.AnalysisDetail.route}/{fileId}") { backStackEntry ->
            val fileId = backStackEntry.arguments?.getString("fileId") ?: "1"
            // Show analysis details for specific file
            AnalysisScreen()
        }
        
        composable(Screen.PersonalDetails.route) {
            PersonalDetailsScreen()
        }
        
        composable(Screen.MedicalHistory.route) {
            // Simple medical history screen
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Text(
                        text = "Medical History",
                        style = MaterialTheme.typography.h5,
                        fontWeight = FontWeight.Bold
                    )
                }
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = 2.dp,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Conditions", style = MaterialTheme.typography.subtitle1, fontWeight = FontWeight.Bold)
                            Text("• Hypertension (2020)", style = MaterialTheme.typography.body2)
                            Text("• Type 2 Diabetes (2019)", style = MaterialTheme.typography.body2)
                        }
                    }
                }
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = 2.dp,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Allergies", style = MaterialTheme.typography.subtitle1, fontWeight = FontWeight.Bold)
                            Text("• Penicillin", style = MaterialTheme.typography.body2)
                            Text("• Shellfish", style = MaterialTheme.typography.body2)
                        }
                    }
                }
            }
        }
        
        composable(Screen.DataPermissions.route) {
            // Simple data permissions screen
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Text(
                        text = "Data Permissions",
                        style = MaterialTheme.typography.h5,
                        fontWeight = FontWeight.Bold
                    )
                }
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = 2.dp,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Health Connect Access", style = MaterialTheme.typography.subtitle1, fontWeight = FontWeight.Bold)
                            Text("✓ Read health data", style = MaterialTheme.typography.body2, color = Color(0xFF4CAF50))
                            Text("✓ Write health data", style = MaterialTheme.typography.body2, color = Color(0xFF4CAF50))
                        }
                    }
                }
            }
        }
        
        composable(Screen.ExportData.route) {
            ExportDataScreen()
        }
        
        composable(Screen.DataSync.route) {
            DataSyncScreen()
        }
        
        composable(Screen.Notifications.route) {
            NotificationsScreen()
        }
        
        composable("${Screen.DownloadFile.route}/{fileId}") { backStackEntry ->
            val fileId = backStackEntry.arguments?.getString("fileId") ?: "1"
            // For now, use mock data - in a real app, you'd fetch this from the file record
            DownloadFileScreen(
                rootHash = "0x1234567890abcdef", // Mock root hash
                fileName = "medical_file_$fileId.pdf",
                mimeType = "application/pdf",
                encryptionMetadata = null,
                onDownloadComplete = { navController.popBackStack() }
            )
        }
        
        composable("${Screen.ShareFile.route}/{fileId}") { backStackEntry ->
            val fileId = backStackEntry.arguments?.getString("fileId") ?: "1"
            ShareFileScreen(
                fileId = fileId,
                onShareComplete = { navController.popBackStack() }
            )
        }
        
        composable(Screen.BlockchainWallet.route) {
            BlockchainWalletScreen()
        }
        
        composable(Screen.SharingSettings.route) {
            // Simple sharing settings screen
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Text(
                        text = "Sharing Settings",
                        style = MaterialTheme.typography.h5,
                        fontWeight = FontWeight.Bold
                    )
                }
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = 2.dp,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Default Share Settings", style = MaterialTheme.typography.subtitle1, fontWeight = FontWeight.Bold)
                            Text("• Files expire after 30 days", style = MaterialTheme.typography.body2)
                            Text("• Download allowed by default", style = MaterialTheme.typography.body2)
                            Text("• Email notifications enabled", style = MaterialTheme.typography.body2)
                        }
                    }
                }
            }
        }
        
        composable(Screen.PrivacyPolicyDetail.route) {
            // Simple privacy policy screen
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Text(
                        text = "Privacy Policy",
                        style = MaterialTheme.typography.h5,
                        fontWeight = FontWeight.Bold
                    )
                }
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = 2.dp,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Data Protection", style = MaterialTheme.typography.subtitle1, fontWeight = FontWeight.Bold)
                            Text("MediVet is committed to protecting your medical data privacy. All data is encrypted and stored on the decentralized 0G Network.", style = MaterialTheme.typography.body2)
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("Key Points:", style = MaterialTheme.typography.subtitle2, fontWeight = FontWeight.Bold)
                            Text("• Your data is encrypted end-to-end", style = MaterialTheme.typography.body2)
                            Text("• You control who has access", style = MaterialTheme.typography.body2)
                            Text("• Data is stored on decentralized network", style = MaterialTheme.typography.body2)
                            Text("• No data is sold to third parties", style = MaterialTheme.typography.body2)
                        }
                    }
                }
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
