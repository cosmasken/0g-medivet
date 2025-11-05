package com.medivet.healthconnect.presentation.screen.medicalrecords

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.medivet.healthconnect.presentation.viewmodel.MedicalRecordViewModel

@Composable
fun MedicalRecordsScreen(
    modifier: Modifier = Modifier,
    medicalRecordViewModel: MedicalRecordViewModel = viewModel(),
    onNavigateToAddMedicalRecord: () -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Medical Records Screen")
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = onNavigateToAddMedicalRecord,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Add Medical Record")
        }
    }
}