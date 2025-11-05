package com.medivet.healthconnect.presentation.screen.compute

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Button
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.DropdownMenuItem
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.ExposedDropdownMenuBox
import androidx.compose.material.ExposedDropdownMenuDefaults
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.medivet.healthconnect.data.api.model.ComputeAnalysisRequest
import com.medivet.healthconnect.data.api.model.FileData
import com.medivet.healthconnect.data.api.model.MedicalRecord
import com.medivet.healthconnect.presentation.viewmodel.ComputeViewModel
import com.medivet.healthconnect.presentation.viewmodel.MedicalRecordViewModel

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun ComputeScreen(
    userId: String,
    modifier: Modifier = Modifier,
    computeViewModel: ComputeViewModel = viewModel(),
    medicalRecordViewModel: MedicalRecordViewModel = viewModel()
) {
    val computeUiState by computeViewModel.uiState.collectAsState()
    val medicalRecordUiState by medicalRecordViewModel.uiState.collectAsState()

    var selectedRecord by remember { mutableStateOf<MedicalRecord?>(null) }
    var isDropdownExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        medicalRecordViewModel.getMedicalRecords(userId)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "AI Medical Analysis",
            style = MaterialTheme.typography.h5
        )

        Spacer(modifier = Modifier.height(24.dp))

        Box {
            ExposedDropdownMenuBox(
                expanded = isDropdownExpanded,
                onExpandedChange = { isDropdownExpanded = !isDropdownExpanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                TextField(
                    value = selectedRecord?.title ?: "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Select Medical Record") },
                    trailingIcon = {
                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropdownExpanded)
                    },
                    modifier = Modifier.fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = isDropdownExpanded,
                    onDismissRequest = { isDropdownExpanded = false }
                ) {
                    medicalRecordUiState.medicalRecords.forEach { record ->
                        DropdownMenuItem(
                            onClick = {
                                selectedRecord = record
                                isDropdownExpanded = false
                            }
                        ) {
                            Text(record.title)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                selectedRecord?.let {
                    val request = ComputeAnalysisRequest(
                        fileData = FileData(
                            name = it.title,
                            age = 45, // Mock data
                            medications = listOf("aspirin", "metformin"), // Mock data
                            diagnosis = "Type 2 diabetes", // Mock data
                            labResults = emptyMap() // Mock data
                        ),
                        analysisType = "medical-analysis",
                        userId = userId,
                        fileId = it.id
                    )
                    computeViewModel.analyzeMedicalData(request)
                }
            },
            enabled = !computeUiState.isLoading && selectedRecord != null,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Analyze Medical Data")
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (computeUiState.isLoading) {
            CircularProgressIndicator()
        } else if (computeUiState.error != null) {
            Text(
                text = computeUiState.error!!,
                color = MaterialTheme.colors.error,
                style = MaterialTheme.typography.body1
            )
        } else if (computeUiState.analysisResult != null) {
            Column(horizontalAlignment = Alignment.Start, modifier = Modifier.fillMaxWidth()) {
                Text("Analysis Complete!", style = MaterialTheme.typography.h6)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Job ID: ${computeUiState.analysisResult!!.jobId}")
                Spacer(modifier = Modifier.height(8.dp))
                Text("Analysis: ${computeUiState.analysisResult!!.analysis}")
            }
        }
    }
}