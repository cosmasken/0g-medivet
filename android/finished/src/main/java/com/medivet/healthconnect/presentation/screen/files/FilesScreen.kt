package com.medivet.healthconnect.presentation.screen.files

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

data class MedicalFile(
    val id: String,
    val name: String,
    val type: FileType,
    val size: String,
    val uploadDate: String,
    val analysisStatus: AnalysisStatus,
    val category: String
)

enum class FileType(val displayName: String, val icon: ImageVector) {
    LAB_REPORT("Lab Report", Icons.Default.Science),
    MEDICAL_IMAGE("Medical Image", Icons.Default.Image),
    PRESCRIPTION("Prescription", Icons.Default.LocalPharmacy),
    DOCUMENT("Document", Icons.Default.Description),
    SCAN("Scan", Icons.Default.Scanner)
}

enum class AnalysisStatus(val displayName: String, val color: Color) {
    PENDING("Pending", Color(0xFFFF9800)),
    ANALYZING("Analyzing", Color(0xFF2196F3)),
    COMPLETED("Completed", Color(0xFF4CAF50)),
    FAILED("Failed", Color(0xFFF44336))
}

@Composable
fun FilesScreen(
    modifier: Modifier = Modifier,
    onUploadFile: () -> Unit = {},
    onFileClick: (String) -> Unit = {},
    onAnalyzeClick: (String) -> Unit = {},
    onDownloadClick: ((String) -> Unit)? = null
) {
    val files = remember {
        listOf(
            MedicalFile("1", "Blood Test Results - March 2024", FileType.LAB_REPORT, "2.3 MB", "2 days ago", AnalysisStatus.COMPLETED, "Laboratory"),
            MedicalFile("2", "Chest X-Ray", FileType.MEDICAL_IMAGE, "15.7 MB", "1 week ago", AnalysisStatus.COMPLETED, "Radiology"),
            MedicalFile("3", "Prescription - Dr. Smith", FileType.PRESCRIPTION, "0.8 MB", "3 days ago", AnalysisStatus.PENDING, "Medication"),
            MedicalFile("4", "MRI Brain Scan", FileType.SCAN, "45.2 MB", "2 weeks ago", AnalysisStatus.COMPLETED, "Radiology"),
            MedicalFile("5", "Vaccination Record", FileType.DOCUMENT, "1.1 MB", "1 month ago", AnalysisStatus.COMPLETED, "Immunization"),
            MedicalFile("6", "ECG Report", FileType.LAB_REPORT, "3.4 MB", "5 days ago", AnalysisStatus.ANALYZING, "Cardiology")
        )
    }

    var selectedCategory by remember { mutableStateOf("All") }
    val categories = listOf("All", "Laboratory", "Radiology", "Medication", "Immunization", "Cardiology")

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Medical Files",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            FloatingActionButton(
                onClick = onUploadFile,
                modifier = Modifier.size(48.dp),
                backgroundColor = MaterialTheme.colors.primary
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Upload File",
                    tint = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Category filter
        LazyColumn {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    categories.forEach { category ->
                        Button(
                            onClick = { selectedCategory = category },
                            colors = ButtonDefaults.buttonColors(
                                backgroundColor = if (selectedCategory == category) 
                                    MaterialTheme.colors.primary 
                                else 
                                    MaterialTheme.colors.surface,
                                contentColor = if (selectedCategory == category) 
                                    Color.White 
                                else 
                                    MaterialTheme.colors.onSurface
                            ),
                            modifier = Modifier.height(32.dp)
                        ) {
                            if (selectedCategory == category) {
                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                            }
                            Text(category, style = MaterialTheme.typography.caption)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
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
                            imageVector = Icons.Default.CloudUpload,
                            contentDescription = "Upload",
                            tint = MaterialTheme.colors.primary,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text(
                                text = "Upload New File",
                                style = MaterialTheme.typography.subtitle1,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "Add medical documents, images, or reports",
                                style = MaterialTheme.typography.caption,
                                color = Color.Gray
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            val filteredFiles = if (selectedCategory == "All") files else files.filter { it.category == selectedCategory }
            
            items(filteredFiles) { file ->
                FileItem(
                    file = file,
                    onFileClick = { onFileClick(file.id) },
                    onAnalyzeClick = { onAnalyzeClick(file.id) },
                    onDownloadClick = onDownloadClick?.let { { onDownloadClick(file.id) } }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
fun FileItem(
    file: MedicalFile,
    onFileClick: (MedicalFile) -> Unit,
    onAnalyzeClick: (MedicalFile) -> Unit,
    onDownloadClick: ((MedicalFile) -> Unit)? = null
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 2.dp,
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = file.type.icon,
                    contentDescription = file.type.displayName,
                    tint = MaterialTheme.colors.primary,
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
                        text = "${file.type.displayName} • ${file.size} • ${file.uploadDate}",
                        style = MaterialTheme.typography.caption,
                        color = Color.Gray
                    )
                }
                Card(
                    modifier = Modifier.clip(RoundedCornerShape(16.dp)),
                    backgroundColor = file.analysisStatus.color.copy(alpha = 0.1f),
                    elevation = 0.dp
                ) {
                    Text(
                        text = file.analysisStatus.displayName,
                        color = file.analysisStatus.color,
                        style = MaterialTheme.typography.caption,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { onFileClick(file) },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Visibility,
                        contentDescription = "View",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("View")
                }
                
                onDownloadClick?.let { downloadClick ->
                    OutlinedButton(
                        onClick = { downloadClick(file) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Download,
                            contentDescription = "Download",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Download")
                    }
                }
                
                if (file.analysisStatus == AnalysisStatus.COMPLETED) {
                    OutlinedButton(
                        onClick = { onAnalyzeClick(file) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Analytics,
                            contentDescription = "Analysis",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Analysis")
                    }
                }
            }
        }
    }
}
