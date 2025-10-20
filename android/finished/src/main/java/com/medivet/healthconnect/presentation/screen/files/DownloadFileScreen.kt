package com.medivet.healthconnect.presentation.screen.files

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun DownloadFileScreen(
    fileId: String = "1",
    modifier: Modifier = Modifier,
    onDownloadComplete: () -> Unit = {}
) {
    var isDownloading by remember { mutableStateOf(false) }
    var downloadProgress by remember { mutableStateOf(0f) }
    var selectedFormat by remember { mutableStateOf("Original") }
    var selectedQuality by remember { mutableStateOf("High") }

    val file = remember {
        MedicalFile(
            id = fileId,
            name = "Blood Test Results - March 2024",
            type = FileType.LAB_REPORT,
            size = "2.3 MB",
            uploadDate = "2 days ago",
            analysisStatus = AnalysisStatus.COMPLETED,
            category = "Laboratory"
        )
    }

    LaunchedEffect(isDownloading) {
        if (isDownloading) {
            for (i in 0..100 step 5) {
                downloadProgress = i / 100f
                kotlinx.coroutines.delay(150)
            }
            kotlinx.coroutines.delay(1000)
            onDownloadComplete()
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
                text = "Download File",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = file.type.icon,
                        contentDescription = file.type.displayName,
                        tint = MaterialTheme.colors.primary,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = file.name,
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${file.type.displayName} • ${file.size}",
                            style = MaterialTheme.typography.body2,
                            color = Color.Gray
                        )
                    }
                }
            }
        }

        if (!isDownloading) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Download Options",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Text(
                            text = "Format",
                            style = MaterialTheme.typography.body2,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        val formats = listOf("Original", "PDF", "JPEG", "PNG")
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            formats.forEach { format ->
                                Button(
                                    onClick = { selectedFormat = format },
                                    colors = ButtonDefaults.buttonColors(
                                        backgroundColor = if (selectedFormat == format) 
                                            MaterialTheme.colors.primary 
                                        else 
                                            MaterialTheme.colors.surface
                                    ),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(format, style = MaterialTheme.typography.caption)
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "Quality",
                            style = MaterialTheme.typography.body2,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        val qualities = listOf("High", "Medium", "Low")
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            qualities.forEach { quality ->
                                Button(
                                    onClick = { selectedQuality = quality },
                                    colors = ButtonDefaults.buttonColors(
                                        backgroundColor = if (selectedQuality == quality) 
                                            MaterialTheme.colors.primary 
                                        else 
                                            MaterialTheme.colors.surface
                                    ),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(quality, style = MaterialTheme.typography.caption)
                                }
                            }
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
                            text = "Download Information",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        DownloadInfoRow("Estimated Size", "2.3 MB")
                        DownloadInfoRow("Storage Location", "0G Network")
                        DownloadInfoRow("Encryption", "AES-256 Encrypted")
                        DownloadInfoRow("Expires", "Never")
                    }
                }
            }

            item {
                Button(
                    onClick = { isDownloading = true },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Download File")
                }
            }
        } else {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = 4.dp,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.CloudDownload,
                            contentDescription = "Downloading",
                            tint = MaterialTheme.colors.primary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "Downloading from 0G Network...",
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        LinearProgressIndicator(
                            progress = downloadProgress,
                            modifier = Modifier.fillMaxWidth()
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "${(downloadProgress * 100).toInt()}% Complete",
                            style = MaterialTheme.typography.caption,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DownloadInfoRow(label: String, value: String) {
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
