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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun AllFilesScreen(
    modifier: Modifier = Modifier,
    onFileClick: (MedicalFile) -> Unit = {},
    onAnalyzeClick: (MedicalFile) -> Unit = {},
    onUploadFile: () -> Unit = {}
) {
    val allFiles = remember {
        listOf(
            MedicalFile("1", "Blood Test Results - March 2024", FileType.LAB_REPORT, "2.3 MB", "2 days ago", AnalysisStatus.COMPLETED, "Laboratory"),
            MedicalFile("2", "Chest X-Ray", FileType.MEDICAL_IMAGE, "15.7 MB", "1 week ago", AnalysisStatus.COMPLETED, "Radiology"),
            MedicalFile("3", "Prescription - Dr. Smith", FileType.PRESCRIPTION, "0.8 MB", "3 days ago", AnalysisStatus.PENDING, "Medication"),
            MedicalFile("4", "MRI Brain Scan", FileType.SCAN, "45.2 MB", "2 weeks ago", AnalysisStatus.COMPLETED, "Radiology"),
            MedicalFile("5", "Vaccination Record", FileType.DOCUMENT, "1.1 MB", "1 month ago", AnalysisStatus.COMPLETED, "Immunization"),
            MedicalFile("6", "ECG Report", FileType.LAB_REPORT, "3.4 MB", "5 days ago", AnalysisStatus.ANALYZING, "Cardiology"),
            MedicalFile("7", "Ultrasound Abdomen", FileType.MEDICAL_IMAGE, "8.9 MB", "1 week ago", AnalysisStatus.COMPLETED, "Radiology"),
            MedicalFile("8", "Allergy Test Results", FileType.LAB_REPORT, "1.2 MB", "2 weeks ago", AnalysisStatus.COMPLETED, "Laboratory"),
            MedicalFile("9", "Physical Therapy Notes", FileType.DOCUMENT, "0.5 MB", "3 weeks ago", AnalysisStatus.COMPLETED, "Therapy"),
            MedicalFile("10", "Dental X-Ray", FileType.MEDICAL_IMAGE, "4.1 MB", "1 month ago", AnalysisStatus.COMPLETED, "Dental"),
            MedicalFile("11", "Prescription - Dr. Johnson", FileType.PRESCRIPTION, "0.7 MB", "1 week ago", AnalysisStatus.PENDING, "Medication"),
            MedicalFile("12", "CT Scan Chest", FileType.SCAN, "32.5 MB", "3 weeks ago", AnalysisStatus.COMPLETED, "Radiology")
        )
    }

    var selectedCategory by remember { mutableStateOf("All") }
    val categories = listOf("All", "Laboratory", "Radiology", "Medication", "Immunization", "Cardiology", "Therapy", "Dental")

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
                text = "All Medical Files (${allFiles.size})",
                style = MaterialTheme.typography.h6,
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
                    categories.take(4).forEach { category ->
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
                            Text(category, style = MaterialTheme.typography.caption)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    categories.drop(4).forEach { category ->
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
                            Text(category, style = MaterialTheme.typography.caption)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            val filteredFiles = if (selectedCategory == "All") allFiles else allFiles.filter { it.category == selectedCategory }
            
            items(filteredFiles) { file ->
                FileItem(
                    file = file,
                    onFileClick = onFileClick,
                    onAnalyzeClick = onAnalyzeClick
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}
