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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.medivet.healthconnect.data.DownloadStatus
import com.medivet.healthconnect.presentation.viewmodel.DownloadViewModel
import com.medivet.healthconnect.util.EncryptionUtils
import com.medivet.healthconnect.util.SharedPreferencesHelper

@Composable
fun DownloadFileScreen(
    rootHash: String,
    fileName: String,
    mimeType: String = "application/octet-stream",
    encryptionMetadata: EncryptionUtils.EncryptionMetadata? = null,
    modifier: Modifier = Modifier,
    onDownloadComplete: () -> Unit = {},
    viewModel: DownloadViewModel = viewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    
    var selectedNetworkType by remember { mutableStateOf("standard") }
    var showAdvancedOptions by remember { mutableStateOf(false) }

    // Handle download completion
    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) {
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
                        imageVector = Icons.Default.CloudDownload,
                        contentDescription = "Download File",
                        tint = MaterialTheme.colors.primary,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = fileName,
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "From 0G Storage • $mimeType",
                            style = MaterialTheme.typography.body2,
                            color = Color.Gray
                        )
                        if (encryptionMetadata != null) {
                            Text(
                                text = "🔒 Encrypted File",
                                style = MaterialTheme.typography.caption,
                                color = Color(0xFF4CAF50)
                            )
                        }
                    }
                }
            }
        }

        if (!uiState.isLoading) {
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
                            text = "Network Type",
                            style = MaterialTheme.typography.body2,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        val networkTypes = listOf("standard" to "Standard", "turbo" to "Turbo")
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            networkTypes.forEach { (value, label) ->
                                Button(
                                    onClick = { selectedNetworkType = value },
                                    colors = ButtonDefaults.buttonColors(
                                        backgroundColor = if (selectedNetworkType == value) 
                                            MaterialTheme.colors.primary 
                                        else 
                                            MaterialTheme.colors.surface,
                                        contentColor = if (selectedNetworkType == value) 
                                            Color.White 
                                        else 
                                            MaterialTheme.colors.onSurface
                                    ),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(label, style = MaterialTheme.typography.caption)
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Advanced options toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Advanced Options",
                                style = MaterialTheme.typography.body2,
                                fontWeight = FontWeight.Medium
                            )
                            Switch(
                                checked = showAdvancedOptions,
                                onCheckedChange = { showAdvancedOptions = it }
                            )
                        }
                        
                        if (showAdvancedOptions) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Root Hash: ${rootHash.take(20)}...",
                                style = MaterialTheme.typography.caption,
                                color = Color.Gray
                            )
                            if (encryptionMetadata != null) {
                                Text(
                                    text = "Encryption: ${encryptionMetadata.algorithm}",
                                    style = MaterialTheme.typography.caption,
                                    color = Color.Gray
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
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Download Information",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        DownloadInfoRow("File Name", fileName)
                        DownloadInfoRow("Storage Location", "0G ${selectedNetworkType.replaceFirstChar { it.uppercase() }} Storage")
                        DownloadInfoRow("Encryption", if (encryptionMetadata != null) "AES-256 Encrypted" else "Not Encrypted")
                        DownloadInfoRow("Network", "0G Galileo Testnet")
                        DownloadInfoRow("MIME Type", mimeType)
                    }
                }
            }

            item {
                Button(
                    onClick = {
                        viewModel.downloadFile(
                            rootHash = rootHash,
                            fileName = fileName,
                            mimeType = mimeType,
                            networkType = selectedNetworkType,
                            encryptionMetadata = encryptionMetadata
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = rootHash.isNotBlank() && rootHash != "unknown"
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
                        
                        val statusText = when (uiState.status) {
                            DownloadStatus.DOWNLOADING -> "Downloading from 0G Storage..."
                            DownloadStatus.DECRYPTING -> "Decrypting file..."
                            DownloadStatus.COMPLETED -> "Download completed!"
                            DownloadStatus.FAILED -> "Download failed"
                            else -> "Processing..."
                        }
                        
                        Text(
                            text = statusText,
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        LinearProgressIndicator(
                            progress = uiState.progress / 100f,
                            modifier = Modifier.fillMaxWidth()
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "${uiState.progress}% Complete",
                            style = MaterialTheme.typography.caption,
                            color = Color.Gray
                        )
                    }
                }
            }
        }

        // Error handling
        uiState.error?.let { error ->
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp),
                    backgroundColor = Color(0xFFFFEBEE)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Error,
                            contentDescription = "Error",
                            tint = Color(0xFFD32F2F),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Download Failed",
                                style = MaterialTheme.typography.subtitle2,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFD32F2F)
                            )
                            Text(
                                text = error,
                                style = MaterialTheme.typography.body2,
                                color = Color(0xFFD32F2F)
                            )
                        }
                    }
                }
            }
        }

        // Success message
        if (uiState.isSuccess && uiState.downloadedFilePath != null) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp),
                    backgroundColor = Color(0xFFE8F5E8)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Success",
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Download Successful!",
                                style = MaterialTheme.typography.subtitle2,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF4CAF50)
                            )
                            Text(
                                text = "File saved to: ${uiState.downloadedFilePath}",
                                style = MaterialTheme.typography.caption,
                                color = Color(0xFF2E7D32)
                            )
                        }
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
