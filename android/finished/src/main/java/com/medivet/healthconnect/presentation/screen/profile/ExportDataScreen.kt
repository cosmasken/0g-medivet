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
fun ExportDataScreen(
    modifier: Modifier = Modifier
) {
    var selectedFormat by remember { mutableStateOf("PDF") }
    var selectedData by remember { mutableStateOf(setOf("medical_files", "health_metrics")) }
    var isExporting by remember { mutableStateOf(false) }
    var exportProgress by remember { mutableStateOf(0f) }

    val formats = listOf("PDF", "JSON", "CSV", "XML")
    val dataTypes = listOf(
        "medical_files" to "Medical Files & Documents",
        "health_metrics" to "Health Metrics & Vitals", 
        "analysis_results" to "AI Analysis Results",
        "personal_info" to "Personal Information",
        "medical_history" to "Medical History"
    )

    LaunchedEffect(isExporting) {
        if (isExporting) {
            for (i in 0..100 step 5) {
                exportProgress = i / 100f
                kotlinx.coroutines.delay(100)
            }
            kotlinx.coroutines.delay(1000)
            isExporting = false
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
                text = "Export Your Data",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Download your medical data in various formats",
                style = MaterialTheme.typography.body2,
                color = Color.Gray
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
                        text = "Export Format",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    formats.chunked(2).forEach { rowFormats ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            rowFormats.forEach { format ->
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
                                    Text(format)
                                }
                            }
                            if (rowFormats.size == 1) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
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
                        text = "Select Data to Export",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    dataTypes.forEach { (key, label) ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = selectedData.contains(key),
                                onCheckedChange = { checked ->
                                    selectedData = if (checked) {
                                        selectedData + key
                                    } else {
                                        selectedData - key
                                    }
                                }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(label, style = MaterialTheme.typography.body2)
                        }
                    }
                }
            }
        }

        if (isExporting) {
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
                            imageVector = Icons.Default.Download,
                            contentDescription = "Exporting",
                            tint = MaterialTheme.colors.primary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "Exporting Data...",
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        LinearProgressIndicator(
                            progress = exportProgress,
                            modifier = Modifier.fillMaxWidth()
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "${(exportProgress * 100).toInt()}% Complete",
                            style = MaterialTheme.typography.caption,
                            color = Color.Gray
                        )
                    }
                }
            }
        } else {
            item {
                Button(
                    onClick = { isExporting = true },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = selectedData.isNotEmpty()
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Export Data (${selectedData.size} categories)")
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 1.dp,
                shape = RoundedCornerShape(8.dp),
                backgroundColor = Color(0xFFF5F5F5)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = "Info",
                            tint = MaterialTheme.colors.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Export Information",
                            style = MaterialTheme.typography.subtitle2,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "• Data is encrypted during export\n• Files are stored on 0G Standard Storage\n• Export history is maintained for 30 days\n• Large exports may take several minutes\n• Network: 0G Galileo Testnet",
                        style = MaterialTheme.typography.caption,
                        color = Color.Gray
                    )
                }
            }
        }
    }
}
