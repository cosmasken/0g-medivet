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

data class ShareContact(
    val id: String,
    val name: String,
    val type: String,
    val email: String? = null,
    val isProvider: Boolean = false
)

@Composable
fun ShareFileScreen(
    fileId: String = "1",
    modifier: Modifier = Modifier,
    onShareComplete: () -> Unit = {}
) {
    var selectedContacts by remember { mutableStateOf(setOf<String>()) }
    var shareMessage by remember { mutableStateOf("") }
    var expirationDays by remember { mutableStateOf(30) }
    var allowDownload by remember { mutableStateOf(true) }
    var isSharing by remember { mutableStateOf(false) }

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

    val contacts = remember {
        listOf(
            ShareContact("1", "Dr. Sarah Johnson", "Cardiologist", "dr.johnson@cityhospital.com", true),
            ShareContact("2", "Dr. Michael Chen", "General Practitioner", "m.chen@familycare.com", true),
            ShareContact("3", "Jane Doe", "Emergency Contact", "jane.doe@email.com"),
            ShareContact("4", "City Medical Center", "Healthcare Provider", "records@citymedical.com", true),
            ShareContact("5", "Insurance Provider", "Insurance", "claims@healthinsure.com")
        )
    }

    LaunchedEffect(isSharing) {
        if (isSharing) {
            kotlinx.coroutines.delay(2000)
            onShareComplete()
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
                text = "Share Medical File",
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

        if (!isSharing) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Select Recipients",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        contacts.forEach { contact ->
                            ShareContactItem(
                                contact = contact,
                                isSelected = selectedContacts.contains(contact.id),
                                onSelectionChange = { selected ->
                                    selectedContacts = if (selected) {
                                        selectedContacts + contact.id
                                    } else {
                                        selectedContacts - contact.id
                                    }
                                }
                            )
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
                            text = "Share Settings",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        OutlinedTextField(
                            value = shareMessage,
                            onValueChange = { shareMessage = it },
                            label = { Text("Message (Optional)") },
                            placeholder = { Text("Add a message for recipients") },
                            modifier = Modifier.fillMaxWidth(),
                            maxLines = 3
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "Access expires in: $expirationDays days",
                            style = MaterialTheme.typography.body2,
                            fontWeight = FontWeight.Medium
                        )
                        Slider(
                            value = expirationDays.toFloat(),
                            onValueChange = { expirationDays = it.toInt() },
                            valueRange = 1f..90f,
                            steps = 89
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Allow Download",
                                style = MaterialTheme.typography.body2,
                                fontWeight = FontWeight.Medium
                            )
                            Switch(
                                checked = allowDownload,
                                onCheckedChange = { allowDownload = it }
                            )
                        }
                    }
                }
            }

            item {
                Button(
                    onClick = { isSharing = true },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = selectedContacts.isNotEmpty()
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Share with ${selectedContacts.size} recipient(s)")
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
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Shared",
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "File Shared Successfully!",
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "Recipients will receive secure access links via email",
                            style = MaterialTheme.typography.body2,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ShareContactItem(
    contact: ShareContact,
    isSelected: Boolean,
    onSelectionChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = isSelected,
            onCheckedChange = onSelectionChange
        )
        Spacer(modifier = Modifier.width(12.dp))
        
        Card(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(20.dp)),
            backgroundColor = if (contact.isProvider) 
                MaterialTheme.colors.primary.copy(alpha = 0.1f) 
            else 
                Color(0xFFE0E0E0),
            elevation = 0.dp
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.fillMaxSize()
            ) {
                Icon(
                    imageVector = if (contact.isProvider) Icons.Default.LocalHospital else Icons.Default.Person,
                    contentDescription = contact.type,
                    tint = if (contact.isProvider) MaterialTheme.colors.primary else Color.Gray,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = contact.name,
                style = MaterialTheme.typography.body1,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = contact.type,
                style = MaterialTheme.typography.caption,
                color = Color.Gray
            )
        }
    }
}
