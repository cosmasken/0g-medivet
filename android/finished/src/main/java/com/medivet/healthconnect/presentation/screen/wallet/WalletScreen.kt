package com.medivet.healthconnect.presentation.screen.wallet

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.medivet.healthconnect.presentation.viewmodel.WalletViewModel
import com.medivet.healthconnect.presentation.viewmodel.WalletState
import com.medivet.healthconnect.presentation.viewmodel.TransactionState

/**
 * Screen for demonstrating wallet functionality and transaction signing.
 */
@Composable
fun WalletScreen(
    walletViewModel: WalletViewModel = viewModel()
) {
    val walletState by walletViewModel.walletState.collectAsState()
    val transactionState by walletViewModel.transactionState.collectAsState()
    
    var showGrantAccessDialog by remember { mutableStateOf(false) }
    var showPayFeeDialog by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Text(
            text = "Wallet & Transactions",
            style = MaterialTheme.typography.h5,
            fontWeight = FontWeight.Bold
        )
        
        // Wallet Status Card
        WalletStatusCard(
            walletState = walletState,
            onRefreshBalance = { walletViewModel.refreshBalance() }
        )
        
        // Transaction Status Card
        if (transactionState.isProcessing || transactionState.lastTransactionHash != null) {
            TransactionStatusCard(transactionState = transactionState)
        }
        
        // Action Buttons
        if (walletState.isInitialized) {
            Text(
                text = "Available Actions",
                style = MaterialTheme.typography.h6,
                fontWeight = FontWeight.Medium
            )
            
            Button(
                onClick = { showGrantAccessDialog = true },
                modifier = Modifier.fillMaxWidth(),
                enabled = !transactionState.isProcessing
            ) {
                Icon(Icons.Default.Share, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Grant Provider Access")
            }
            
            Button(
                onClick = { showPayFeeDialog = true },
                modifier = Modifier.fillMaxWidth(),
                enabled = !transactionState.isProcessing
            ) {
                Icon(Icons.Default.Payment, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Pay Storage Fee")
            }
            
            OutlinedButton(
                onClick = { 
                    val message = "MediVet Authentication ${System.currentTimeMillis()}"
                    val signature = walletViewModel.signMessage(message)
                    // In a real app, you'd use this signature for authentication
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !transactionState.isProcessing
            ) {
                Icon(Icons.Default.Security, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sign Authentication Message")
            }
        }
        
        // Error Display
        walletState.error?.let { error ->
            Card(
                backgroundColor = Color.Red.copy(alpha = 0.1f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Error,
                        contentDescription = null,
                        tint = Color.Red
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = error,
                        color = Color.Red,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = { walletViewModel.clearErrors() }) {
                        Icon(Icons.Default.Close, contentDescription = "Clear error")
                    }
                }
            }
        }
        
        transactionState.error?.let { error ->
            Card(
                backgroundColor = Color.Red.copy(alpha = 0.1f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Error,
                        contentDescription = null,
                        tint = Color.Red
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = error,
                        color = Color.Red,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = { walletViewModel.clearErrors() }) {
                        Icon(Icons.Default.Close, contentDescription = "Clear error")
                    }
                }
            }
        }
    }
    
    // Dialogs
    if (showGrantAccessDialog) {
        GrantAccessDialog(
            onDismiss = { showGrantAccessDialog = false },
            onConfirm = { providerAddress, recordHash ->
                walletViewModel.grantProviderAccess(providerAddress, recordHash)
                showGrantAccessDialog = false
            }
        )
    }
    
    if (showPayFeeDialog) {
        PayFeeDialog(
            onDismiss = { showPayFeeDialog = false },
            onConfirm = { nodeAddress, amount ->
                walletViewModel.payStorageFee(nodeAddress, amount)
                showPayFeeDialog = false
            }
        )
    }
}

@Composable
private fun WalletStatusCard(
    walletState: WalletState,
    onRefreshBalance: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Wallet Status",
                    style = MaterialTheme.typography.h6,
                    fontWeight = FontWeight.Medium
                )
                
                if (walletState.isInitialized) {
                    IconButton(onClick = onRefreshBalance) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh balance")
                    }
                }
            }
            
            if (walletState.isLoading) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Initializing wallet...")
                }
            } else if (walletState.isInitialized) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Address:",
                        style = MaterialTheme.typography.caption,
                        color = MaterialTheme.colors.onSurface.copy(alpha = 0.6f)
                    )
                    Text(
                        text = walletState.walletAddress ?: "Unknown",
                        style = MaterialTheme.typography.body2,
                        fontWeight = FontWeight.Medium
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "Balance:",
                        style = MaterialTheme.typography.caption,
                        color = MaterialTheme.colors.onSurface.copy(alpha = 0.6f)
                    )
                    Text(
                        text = "${walletState.balance} ETH",
                        style = MaterialTheme.typography.h6,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colors.primary
                    )
                }
            } else {
                Text(
                    text = "Wallet not initialized",
                    color = MaterialTheme.colors.onSurface.copy(alpha = 0.6f)
                )
            }
        }
    }
}

@Composable
private fun TransactionStatusCard(transactionState: TransactionState) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Transaction Status",
                style = MaterialTheme.typography.h6,
                fontWeight = FontWeight.Medium
            )
            
            if (transactionState.isProcessing) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(transactionState.currentOperation ?: "Processing...")
                }
            }
            
            transactionState.lastTransactionHash?.let { txHash ->
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Last Transaction:",
                        style = MaterialTheme.typography.caption,
                        color = MaterialTheme.colors.onSurface.copy(alpha = 0.6f)
                    )
                    Text(
                        text = txHash,
                        style = MaterialTheme.typography.body2,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            
            transactionState.lastOperationResult?.let { result ->
                Text(
                    text = result,
                    color = MaterialTheme.colors.primary,
                    fontWeight = FontWeight.Medium
                )
            }
            
            transactionState.confirmationMessage?.let { message ->
                Text(
                    text = message,
                    color = if (transactionState.isConfirmed) Color.Green else Color(0xFFFFA500), // Orange
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
private fun GrantAccessDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String) -> Unit
) {
    var providerAddress by remember { mutableStateOf("") }
    var recordHash by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Grant Provider Access") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = providerAddress,
                    onValueChange = { providerAddress = it },
                    label = { Text("Provider Address") },
                    placeholder = { Text("0x...") }
                )
                OutlinedTextField(
                    value = recordHash,
                    onValueChange = { recordHash = it },
                    label = { Text("Record Hash") },
                    placeholder = { Text("Record identifier") }
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(providerAddress, recordHash) },
                enabled = providerAddress.isNotBlank() && recordHash.isNotBlank()
            ) {
                Text("Grant Access")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun PayFeeDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String) -> Unit
) {
    var nodeAddress by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Pay Storage Fee") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = nodeAddress,
                    onValueChange = { nodeAddress = it },
                    label = { Text("Storage Node Address") },
                    placeholder = { Text("0x...") }
                )
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Amount (ETH)") },
                    placeholder = { Text("0.001") }
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(nodeAddress, amount) },
                enabled = nodeAddress.isNotBlank() && amount.isNotBlank()
            ) {
                Text("Pay Fee")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
