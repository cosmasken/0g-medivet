package com.medivet.healthconnect.presentation.screen.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.unit.sp

data class HealthMetric(
    val title: String,
    val value: String,
    val unit: String,
    val icon: ImageVector,
    val color: Color
)

data class RecentFile(
    val name: String,
    val type: String,
    val date: String,
    val status: String
)

@Composable
fun DashboardScreen(
    modifier: Modifier = Modifier,
    onViewAllFiles: () -> Unit = {},
    onFileClick: (String) -> Unit = {}
) {
    val healthMetrics = listOf(
        HealthMetric("Heart Rate", "72", "bpm", Icons.Default.Favorite, Color(0xFFE91E63)),
        HealthMetric("Steps", "8,432", "today", Icons.Default.DirectionsWalk, Color(0xFF4CAF50)),
        HealthMetric("Sleep", "7.5", "hours", Icons.Default.Bedtime, Color(0xFF2196F3)),
        HealthMetric("Weight", "68.5", "kg", Icons.Default.MonitorWeight, Color(0xFFFF9800))
    )

    val recentFiles = listOf(
        RecentFile("Blood Test Results", "Lab Report", "2 days ago", "Analyzed"),
        RecentFile("X-Ray Chest", "Medical Image", "1 week ago", "Analyzed"),
        RecentFile("Prescription", "Document", "3 days ago", "Uploaded"),
        RecentFile("MRI Scan", "Medical Image", "2 weeks ago", "Analyzed")
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Welcome back, John",
                style = MaterialTheme.typography.h4,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Here's your health overview",
                style = MaterialTheme.typography.body1,
                color = Color.Gray
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Health Metrics",
                        style = MaterialTheme.typography.h6,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(healthMetrics) { metric ->
                            HealthMetricCard(metric = metric)
                        }
                    }
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Recent Files",
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold
                        )
                        TextButton(onClick = onViewAllFiles) {
                            Text("View All")
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }

        items(recentFiles) { file ->
            RecentFileItem(file = file)
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "AI Analysis Summary",
                        style = MaterialTheme.typography.h6,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "• Blood test shows normal glucose levels\n• Heart rate variability is within healthy range\n• Sleep quality has improved by 15% this month",
                        style = MaterialTheme.typography.body2,
                        lineHeight = 20.sp
                    )
                }
            }
        }
    }
}

@Composable
fun HealthMetricCard(metric: HealthMetric) {
    Card(
        modifier = Modifier
            .width(120.dp)
            .height(100.dp),
        elevation = 2.dp,
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceEvenly
        ) {
            Icon(
                imageVector = metric.icon,
                contentDescription = metric.title,
                tint = metric.color,
                modifier = Modifier.size(24.dp)
            )
            Text(
                text = metric.value,
                style = MaterialTheme.typography.h6,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = metric.unit,
                style = MaterialTheme.typography.caption,
                color = Color.Gray
            )
        }
    }
}

@Composable
fun RecentFileItem(file: RecentFile) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 2.dp,
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = when (file.type) {
                    "Lab Report" -> Icons.Default.Science
                    "Medical Image" -> Icons.Default.Image
                    else -> Icons.Default.Description
                },
                contentDescription = file.type,
                tint = Color(0xFF2196F3),
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = file.name,
                    style = MaterialTheme.typography.subtitle1,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "${file.type} • ${file.date}",
                    style = MaterialTheme.typography.caption,
                    color = Color.Gray
                )
            }
            Card(
                modifier = Modifier.clip(RoundedCornerShape(16.dp)),
                backgroundColor = when (file.status) {
                    "Analyzed" -> Color(0xFFE8F5E8)
                    "Uploaded" -> Color(0xFFFFF3E0)
                    else -> Color(0xFFE3F2FD)
                },
                elevation = 0.dp
            ) {
                Text(
                    text = file.status,
                    color = when (file.status) {
                        "Analyzed" -> Color(0xFF4CAF50)
                        "Uploaded" -> Color(0xFFFF9800)
                        else -> Color(0xFF2196F3)
                    },
                    style = MaterialTheme.typography.caption,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}
