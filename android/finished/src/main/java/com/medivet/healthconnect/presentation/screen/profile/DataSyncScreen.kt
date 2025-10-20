package com.medivet.healthconnect.presentation.screen.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun DataSyncScreen(
    modifier: Modifier = Modifier
) {
    var isSyncing by remember { mutableStateOf(false) }
    var syncProgress by remember { mutableStateOf(0f) }
    var autoSyncEnabled by remember { mutableStateOf(true) }
    var lastSyncTime by remember { mutableStateOf("2 minutes ago") }

    val syncItems = listOf(
        SyncItem("Heart Rate", "Synced", "145 records", true, Color(0xFF4CAF50)),
        SyncItem("Steps", "Synced", "30 days", true, Color(0xFF4CAF50)),
        SyncItem("Sleep", "Syncing...", "7 records", false, Color(0xFF2196F3)),
        SyncItem("Weight", "Synced", "12 records", true, Color(0xFF4CAF50)),
        SyncItem("Blood Pressure", "Error", "Connection failed", false, Color(0xFFF44336))
    )

    LaunchedEffect(isSyncing) {
        if (isSyncing) {
            for (i in 0..100 step 10) {
                syncProgress = i / 100f
                kotlinx.coroutines.delay(300)
            }
            lastSyncTime = "Just now"
            isSyncing = false
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Health Connect Sync",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Manage synchronization with Health Connect",
                style = MaterialTheme.typography.body2,
                color = Color.Gray
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Auto Sync",
                                style = MaterialTheme.typography.subtitle1,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Automatically sync health data",
                                style = MaterialTheme.typography.caption,
                                color = Color.Gray
                            )
                        }
                        Switch(
                            checked = autoSyncEnabled,
                            onCheckedChange = { autoSyncEnabled = it }
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Last sync: $lastSyncTime",
                            style = MaterialTheme.typography.body2,
                            color = Color.Gray
                        )
                        
                        if (isSyncing) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp))
                        } else {
                            TextButton(onClick = { isSyncing = true }) {
                                Text("Sync Now")
                            }
                        }
                    }
                }
            }
        }

        if (isSyncing) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Syncing Health Data...",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = syncProgress,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${(syncProgress * 100).toInt()}% Complete",
                            style = MaterialTheme.typography.caption,
                            color = Color.Gray
                        )
                    }
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
                    Text(
                        text = "Sync Status",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    syncItems.forEach { item ->
                        SyncItemRow(item)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
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
                    Text(
                        text = "Sync Settings",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    SyncSettingRow("Sync Frequency", "Every 15 minutes")
                    SyncSettingRow("WiFi Only", "Enabled")
                    SyncSettingRow("Background Sync", "Enabled")
                    SyncSettingRow("Data Usage", "12.3 MB this month")
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Reset Sync")
                }
                
                OutlinedButton(
                    onClick = { },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Settings, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Advanced")
                }
            }
        }
    }
}

data class SyncItem(
    val name: String,
    val status: String,
    val details: String,
    val isSuccess: Boolean,
    val statusColor: Color
)

@Composable
fun SyncItemRow(item: SyncItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = when {
                item.isSuccess -> Icons.Default.CheckCircle
                item.status == "Syncing..." -> Icons.Default.Sync
                else -> Icons.Default.Error
            },
            contentDescription = item.status,
            tint = item.statusColor,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.name,
                style = MaterialTheme.typography.body2,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = item.details,
                style = MaterialTheme.typography.caption,
                color = Color.Gray
            )
        }
        Card(
            modifier = Modifier.clip(RoundedCornerShape(12.dp)),
            backgroundColor = item.statusColor.copy(alpha = 0.1f),
            elevation = 0.dp
        ) {
            Text(
                text = item.status,
                color = item.statusColor,
                style = MaterialTheme.typography.caption,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}

@Composable
fun SyncSettingRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.body2,
            color = Color.Gray
        )
        Text(
            text = value,
            style = MaterialTheme.typography.body2,
            fontWeight = FontWeight.Medium
        )
    }
}
