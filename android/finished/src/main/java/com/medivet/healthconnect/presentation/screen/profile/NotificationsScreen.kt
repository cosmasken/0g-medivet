package com.medivet.healthconnect.presentation.screen.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

data class NotificationItem(
    val id: String,
    val title: String,
    val message: String,
    val time: String,
    val type: NotificationType,
    val isRead: Boolean = false
)

enum class NotificationType(val displayName: String, val icon: ImageVector, val color: Color) {
    ANALYSIS("Analysis Complete", Icons.Default.Analytics, Color(0xFF2196F3)),
    SYNC("Data Sync", Icons.Default.Sync, Color(0xFF4CAF50)),
    REMINDER("Health Reminder", Icons.Default.Notifications, Color(0xFFFF9800)),
    ALERT("Health Alert", Icons.Default.Warning, Color(0xFFF44336)),
    UPDATE("App Update", Icons.Default.SystemUpdate, Color(0xFF9C27B0))
}

@Composable
fun NotificationsScreen(
    modifier: Modifier = Modifier
) {
    var notificationsEnabled by remember { mutableStateOf(true) }
    var analysisNotifications by remember { mutableStateOf(true) }
    var syncNotifications by remember { mutableStateOf(true) }
    var reminderNotifications by remember { mutableStateOf(true) }
    var alertNotifications by remember { mutableStateOf(true) }

    val notifications = remember {
        listOf(
            NotificationItem("1", "AI Analysis Complete", "Blood test results have been analyzed with 94% confidence", "2 min ago", NotificationType.ANALYSIS),
            NotificationItem("2", "Health Data Synced", "Successfully synced 145 heart rate records", "1 hour ago", NotificationType.SYNC, true),
            NotificationItem("3", "Medication Reminder", "Time to take your morning medication", "3 hours ago", NotificationType.REMINDER),
            NotificationItem("4", "Unusual Heart Rate", "Heart rate spike detected during sleep", "1 day ago", NotificationType.ALERT, true),
            NotificationItem("5", "App Update Available", "MediVet v2.1 is now available", "2 days ago", NotificationType.UPDATE, true),
            NotificationItem("6", "Weekly Health Summary", "Your health summary for this week is ready", "3 days ago", NotificationType.ANALYSIS, true)
        )
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Notifications",
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
                    Text(
                        text = "Notification Settings",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    NotificationToggle(
                        title = "Enable Notifications",
                        subtitle = "Receive all app notifications",
                        checked = notificationsEnabled,
                        onCheckedChange = { notificationsEnabled = it }
                    )
                    
                    if (notificationsEnabled) {
                        Divider(modifier = Modifier.padding(vertical = 8.dp))
                        
                        NotificationToggle(
                            title = "Analysis Results",
                            subtitle = "AI analysis completion alerts",
                            checked = analysisNotifications,
                            onCheckedChange = { analysisNotifications = it }
                        )
                        
                        NotificationToggle(
                            title = "Data Sync",
                            subtitle = "Health Connect sync status",
                            checked = syncNotifications,
                            onCheckedChange = { syncNotifications = it }
                        )
                        
                        NotificationToggle(
                            title = "Health Reminders",
                            subtitle = "Medication and appointment reminders",
                            checked = reminderNotifications,
                            onCheckedChange = { reminderNotifications = it }
                        )
                        
                        NotificationToggle(
                            title = "Health Alerts",
                            subtitle = "Unusual health pattern alerts",
                            checked = alertNotifications,
                            onCheckedChange = { alertNotifications = it }
                        )
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Notifications",
                    style = MaterialTheme.typography.subtitle1,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = { }) {
                    Text("Mark All Read")
                }
            }
        }

        items(notifications) { notification ->
            NotificationCard(notification = notification)
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedButton(
                onClick = { },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Settings, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Advanced Notification Settings")
            }
        }
    }
}

@Composable
fun NotificationToggle(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.body1,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.caption,
                color = Color.Gray
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@Composable
fun NotificationCard(notification: NotificationItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = if (notification.isRead) 1.dp else 3.dp,
        shape = RoundedCornerShape(8.dp),
        backgroundColor = if (notification.isRead) Color(0xFFF8F8F8) else MaterialTheme.colors.surface
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Card(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(20.dp)),
                backgroundColor = notification.type.color.copy(alpha = 0.1f),
                elevation = 0.dp
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    Icon(
                        imageVector = notification.type.icon,
                        contentDescription = notification.type.displayName,
                        tint = notification.type.color,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = notification.title,
                    style = MaterialTheme.typography.subtitle2,
                    fontWeight = if (notification.isRead) FontWeight.Normal else FontWeight.Bold
                )
                Text(
                    text = notification.message,
                    style = MaterialTheme.typography.body2,
                    color = Color.Gray,
                    maxLines = 2
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = notification.time,
                    style = MaterialTheme.typography.caption,
                    color = Color.Gray
                )
            }
            
            if (!notification.isRead) {
                Card(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    backgroundColor = MaterialTheme.colors.primary,
                    elevation = 0.dp
                ) {}
            }
        }
    }
}
