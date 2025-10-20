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
fun UploadFileScreen(
    modifier: Modifier = Modifier,
    onUploadComplete: () -> Unit = {}
) {
    var selectedFileType by remember { mutableStateOf(FileType.LAB_REPORT) }
    var selectedCategory by remember { mutableStateOf("Laboratory") }
    var fileName by remember { mutableStateOf("") }
    var selectedFile by remember { mutableStateOf<String?>(null) }
    var isUploading by remember { mutableStateOf(false) }
    var uploadProgress by remember { mutableStateOf(0f) }

    val mockFiles = listOf(
        "blood_test_march_2024.pdf",
        "chest_xray_scan.jpg", 
        "prescription_dr_smith.pdf",
        "mri_brain_scan.dcm",
        "vaccination_record.pdf"
    )

    LaunchedEffect(isUploading) {
        if (isUploading) {
            for (i in 0..100 step 10) {
                uploadProgress = i / 100f
                kotlinx.coroutines.delay(200)
            }
            kotlinx.coroutines.delay(500)
            onUploadComplete()
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
                text = "Upload Medical File",
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
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Select File Type",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    FileType.values().forEach { type ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = selectedFileType == type,
                                onClick = { selectedFileType = type }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(
                                imageVector = type.icon,
                                contentDescription = type.displayName,
                                tint = MaterialTheme.colors.primary,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = type.displayName,
                                style = MaterialTheme.typography.body1
                            )
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
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "File Details",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    OutlinedTextField(
                        value = fileName,
                        onValueChange = { fileName = it },
                        label = { Text("File Name") },
                        placeholder = { Text("Enter file name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        text = "Category",
                        style = MaterialTheme.typography.body2,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    val categories = listOf("Laboratory", "Radiology", "Medication", "Immunization", "Cardiology", "Therapy", "Dental")
                    categories.chunked(2).forEach { rowCategories ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            rowCategories.forEach { category ->
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
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(36.dp)
                                ) {
                                    Text(category, style = MaterialTheme.typography.caption)
                                }
                            }
                            if (rowCategories.size == 1) {
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
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.CloudUpload,
                        contentDescription = "Upload",
                        tint = MaterialTheme.colors.primary,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Choose File to Upload",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Supported formats: PDF, JPG, PNG, DICOM",
                        style = MaterialTheme.typography.caption,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Button(
                        onClick = { selectedFile = mockFiles.random() },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.AttachFile, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Select File")
                    }
                    
                    selectedFile?.let { file ->
                        Spacer(modifier = Modifier.height(12.dp))
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            elevation = 1.dp,
                            shape = RoundedCornerShape(8.dp),
                            backgroundColor = Color(0xFFE8F5E8)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "Selected",
                                    tint = Color(0xFF4CAF50),
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Selected File:",
                                        style = MaterialTheme.typography.caption,
                                        color = Color.Gray
                                    )
                                    Text(
                                        text = file,
                                        style = MaterialTheme.typography.body2,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                IconButton(onClick = { selectedFile = null }) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Remove",
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        if (isUploading) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Uploading...",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = uploadProgress,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${(uploadProgress * 100).toInt()}%",
                            style = MaterialTheme.typography.caption,
                            color = Color.Gray
                        )
                    }
                }
            }
        } else {
            item {
                Button(
                    onClick = { isUploading = true },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = fileName.isNotBlank() && selectedFile != null
                ) {
                    Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Upload File")
                }
            }
        }
    }
}
