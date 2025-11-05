package com.medivet.healthconnect.presentation.screen.medicalrecords

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.medivet.healthconnect.data.api.model.CreateRecordRequest
import com.medivet.healthconnect.presentation.viewmodel.MedicalRecordViewModel
import java.util.UUID

@Composable
fun AddMedicalRecordScreen(
    onRecordAdded: () -> Unit,
    modifier: Modifier = Modifier,
    addMedicalRecordViewModel: AddMedicalRecordViewModel = viewModel(),
    medicalRecordViewModel: MedicalRecordViewModel = viewModel()
) {
    val userId by addMedicalRecordViewModel.userId

    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("general") }
    var specialty by remember { mutableStateOf("general") }
    var fileType by remember { mutableStateOf("pdf") }
    var zeroGHash by remember { mutableStateOf("") }
    var merkleRoot by remember { mutableStateOf("") }
    var transactionHash by remember { mutableStateOf("") }
    var fileSize by remember { mutableStateOf(0L) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Add Medical Record",
            style = MaterialTheme.typography.h5
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = category,
            onValueChange = { category = it },
            label = { Text("Category") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = specialty,
            onValueChange = { specialty = it },
            label = { Text("Specialty") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = fileType,
            onValueChange = { fileType = it },
            label = { Text("File Type") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                // Simulate file selection and hashing
                fileSize = (1024 * 1024 * (1..5).random()).toLong() // 1-5 MB
                zeroGHash = "0x" + UUID.randomUUID().toString().replace("-", "")
                merkleRoot = "0x" + UUID.randomUUID().toString().replace("-", "")
                transactionHash = "0x" + UUID.randomUUID().toString().replace("-", "")
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Select File (Simulated)")
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = zeroGHash,
            onValueChange = { },
            label = { Text("Zero G Hash") },
            modifier = Modifier.fillMaxWidth(),
            readOnly = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = merkleRoot,
            onValueChange = { },
            label = { Text("Merkle Root") },
            modifier = Modifier.fillMaxWidth(),
            readOnly = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = transactionHash,
            onValueChange = { },
            label = { Text("Transaction Hash") },
            modifier = Modifier.fillMaxWidth(),
            readOnly = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                userId?.let {
                    val request = CreateRecordRequest(
                        userId = it,
                        title = title,
                        description = description,
                        category = category,
                        specialty = specialty,
                        fileType = fileType,
                        fileSize = fileSize,
                        zeroGHash = zeroGHash,
                        merkleRoot = merkleRoot,
                        transactionHash = transactionHash,
                        tags = emptyList()
                    )
                    medicalRecordViewModel.createMedicalRecord(request)
                    onRecordAdded()
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = zeroGHash.isNotBlank() && title.isNotBlank() && description.isNotBlank()
        ) {
            Text("Add Record")
        }
    }
}
