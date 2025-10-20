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
            ExerciseSessions,
            InputReadings,
            DifferentialChanges,
            MedicalRecords
        )
    }
}
