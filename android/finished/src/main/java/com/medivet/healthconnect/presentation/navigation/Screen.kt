package com.medivet.healthconnect.presentation.navigation

import androidx.annotation.StringRes
import com.medivet.healthconnect.R

sealed class Screen(
    val route: String, @StringRes val titleId: Int, val hasMenuItem: Boolean = true
) {
    object Login : Screen("login", R.string.login_screen, false)
    object Register : Screen("register", R.string.login_screen, false) // Re-use login title
    object WelcomeScreen : Screen("welcome", R.string.welcome_screen, false)
    object PrivacyPolicy : Screen("privacy_policy", R.string.privacy_policy, false)

    // Main MediVet screens
    object Dashboard : Screen("dashboard", R.string.dashboard)
    object Files : Screen("files", R.string.files)
    object Analysis : Screen("analysis", R.string.analysis)
    object Profile : Screen("profile", R.string.profile)
    
    // Sub-pages
    object AllFiles : Screen("all_files", R.string.all_files, false)
    object FileDetail : Screen("file_detail", R.string.file_detail, false)
    object AnalysisDetail : Screen("analysis_detail", R.string.analysis_detail, false)
    object UploadFile : Screen("upload_file", R.string.upload_file, false)
    object GenerateAnalysis : Screen("generate_analysis", R.string.generate_analysis, false)
    object PersonalDetails : Screen("personal_details", R.string.personal_details, false)
    object MedicalHistory : Screen("medical_history", R.string.medical_history, false)
    object DataPermissions : Screen("data_permissions", R.string.data_permissions, false)
    object ExportData : Screen("export_data", R.string.export_data, false)
    object DataSync : Screen("data_sync", R.string.data_sync, false)
    object Notifications : Screen("notifications", R.string.notifications, false)
    object DownloadFile : Screen("download_file", R.string.download_file, false)
    object ShareFile : Screen("share_file", R.string.share_file, false)
    object BlockchainWallet : Screen("blockchain_wallet", R.string.blockchain_wallet, false)
    object Wallet : Screen("wallet", R.string.wallet)
    object PrivacyPolicyDetail : Screen("privacy_policy_detail", R.string.privacy_policy_detail, false)
    object SharingSettings : Screen("sharing_settings", R.string.sharing_settings, false)
    
    // Legacy Health Connect screens (kept for compatibility)
    object ExerciseSessions : Screen("exercise_sessions", R.string.exercise_sessions)
    object ExerciseSessionDetail : Screen("exercise_session_detail", R.string.exercise_session_detail, false)
    object InputReadings : Screen("input_readings", R.string.input_readings)
    object DifferentialChanges : Screen("differential_changes", R.string.differential_changes)
    object MedicalRecords : Screen("medical_records", R.string.medical_records)
    object AddMedicalRecord : Screen("add_medical_record", R.string.add_medical_record, false)

    companion object {
        val Labeled = listOf(
            Dashboard,
            Files,
            Analysis,
            Profile,
            Wallet,
            ExerciseSessions,
            InputReadings,
            DifferentialChanges,
            MedicalRecords
        )
    }
}
