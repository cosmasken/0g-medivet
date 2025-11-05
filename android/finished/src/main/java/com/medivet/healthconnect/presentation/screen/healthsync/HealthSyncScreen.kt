package com.medivet.healthconnect.presentation.screen.healthsync

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Button
import androidx.compose.material.LinearProgressIndicator
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.medivet.healthconnect.data.HealthConnectManager
import com.medivet.healthconnect.presentation.viewmodel.HealthSyncViewModel

@Composable
fun HealthSyncScreen(
    healthConnectManager: HealthConnectManager,
    userId: String,
    modifier: Modifier = Modifier
) {
    val viewModel: HealthSyncViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Health Connect Sync",
            style = MaterialTheme.typography.h5
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { viewModel.syncHealthDataToBackend(userId, healthConnectManager) },
            enabled = !uiState.isSyncing,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Sync Health Data")
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (uiState.isSyncing) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(8.dp))
                Text(uiState.syncMessage)
            }
        } else {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Last Sync: ${uiState.lastSyncTime ?: "Never"}")
                Spacer(modifier = Modifier.height(8.dp))
                uiState.error?.let {
                    Text(
                        text = it,
                        color = MaterialTheme.colors.error,
                        style = MaterialTheme.typography.body1
                    )
                } ?: run {
                    Text(uiState.syncMessage)
                }
            }
        }
    }
}