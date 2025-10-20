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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

data class Transaction(
    val id: String,
    val type: String,
    val amount: String,
    val description: String,
    val date: String,
    val status: String
)

@Composable
fun BlockchainWalletScreen(
    modifier: Modifier = Modifier
) {
    val walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    val balance = "1,247.89"
    val usdValue = "2,495.78"
    
    val transactions = remember {
        listOf(
            Transaction("1", "Storage Fee", "-0.05 0G", "Medical file storage", "2 hours ago", "Confirmed"),
            Transaction("2", "AI Analysis", "-0.12 0G", "Blood test analysis", "1 day ago", "Confirmed"),
            Transaction("3", "Received", "+50.00 0G", "Initial wallet funding", "1 week ago", "Confirmed"),
            Transaction("4", "Storage Fee", "-0.03 0G", "X-ray image storage", "2 weeks ago", "Confirmed"),
            Transaction("5", "AI Analysis", "-0.08 0G", "ECG analysis", "3 weeks ago", "Confirmed")
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
                text = "Blockchain Wallet",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "0G Galileo Testnet Integration",
                style = MaterialTheme.typography.body2,
                color = Color.Gray
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp),
                backgroundColor = MaterialTheme.colors.primary
            ) {
                Column(
                    modifier = Modifier.padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Total Balance",
                            style = MaterialTheme.typography.body2,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                        Icon(
                            imageVector = Icons.Default.AccountBalanceWallet,
                            contentDescription = "Wallet",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "$balance 0G",
                        style = MaterialTheme.typography.h4,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    
                    Text(
                        text = "≈ $$usdValue USD",
                        style = MaterialTheme.typography.body2,
                        color = Color.White.copy(alpha = 0.8f)
                    )
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
                        text = "Wallet Address",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${walletAddress.take(10)}...${walletAddress.takeLast(8)}",
                            style = MaterialTheme.typography.body2,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { }) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = "Copy Address",
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Funds")
                }
                
                OutlinedButton(
                    onClick = { },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Send")
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
                        text = "Network Information",
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    NetworkInfoRow("Network", "0G Galileo Testnet")
                    NetworkInfoRow("Chain ID", "16602")
                    NetworkInfoRow("Block Height", "2,847,392")
                    NetworkInfoRow("Gas Price", "0.000000001 0G")
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
                    text = "Recent Transactions",
                    style = MaterialTheme.typography.subtitle1,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = { }) {
                    Text("View All")
                }
            }
        }

        items(transactions) { transaction ->
            TransactionItem(transaction = transaction)
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
                            imageVector = Icons.Default.Security,
                            contentDescription = "Security",
                            tint = MaterialTheme.colors.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Security Features",
                            style = MaterialTheme.typography.subtitle2,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "• Private keys stored securely on device\n• All transactions are encrypted\n• Decentralized storage on 0G Network\n• Multi-signature support available",
                        style = MaterialTheme.typography.caption,
                        color = Color.Gray
                    )
                }
            }
        }
    }
}

@Composable
fun NetworkInfoRow(label: String, value: String) {
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

@Composable
fun TransactionItem(transaction: Transaction) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 1.dp,
        shape = RoundedCornerShape(8.dp)
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
                backgroundColor = when (transaction.type) {
                    "Received" -> Color(0xFF4CAF50).copy(alpha = 0.1f)
                    else -> Color(0xFFFF9800).copy(alpha = 0.1f)
                },
                elevation = 0.dp
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    Icon(
                        imageVector = when (transaction.type) {
                            "Received" -> Icons.Default.CallReceived
                            "Storage Fee" -> Icons.Default.Storage
                            "AI Analysis" -> Icons.Default.Psychology
                            else -> Icons.Default.Send
                        },
                        contentDescription = transaction.type,
                        tint = when (transaction.type) {
                            "Received" -> Color(0xFF4CAF50)
                            else -> Color(0xFFFF9800)
                        },
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = transaction.type,
                    style = MaterialTheme.typography.body1,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = transaction.description,
                    style = MaterialTheme.typography.caption,
                    color = Color.Gray
                )
                Text(
                    text = transaction.date,
                    style = MaterialTheme.typography.caption,
                    color = Color.Gray
                )
            }
            
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = transaction.amount,
                    style = MaterialTheme.typography.body2,
                    fontWeight = FontWeight.Bold,
                    color = if (transaction.amount.startsWith("+")) Color(0xFF4CAF50) else Color(0xFFFF9800)
                )
                Card(
                    modifier = Modifier.clip(RoundedCornerShape(12.dp)),
                    backgroundColor = Color(0xFF4CAF50).copy(alpha = 0.1f),
                    elevation = 0.dp
                ) {
                    Text(
                        text = transaction.status,
                        color = Color(0xFF4CAF50),
                        style = MaterialTheme.typography.caption,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }
        }
    }
}
