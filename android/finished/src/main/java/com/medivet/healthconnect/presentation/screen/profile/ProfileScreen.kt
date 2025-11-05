package com.medivet.healthconnect.presentation.screen.profile

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
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

data class ProfileSection(
    val title: String,
    val items: List<ProfileItem>
)

data class ProfileItem(
    val title: String,
    val subtitle: String? = null,
    val icon: ImageVector,
    val onClick: () -> Unit = {}
)

@Composable
fun ProfileScreen(
    modifier: Modifier = Modifier,
    onLogout: () -> Unit = {},
    onPersonalDetails: () -> Unit = {},
    onMedicalHistory: () -> Unit = {},
    onDataPermissions: () -> Unit = {},
    onExportData: () -> Unit = {},
    onDataSync: () -> Unit = {},
    onNotifications: () -> Unit = {},
    onBlockchainWallet: () -> Unit = {},
    onSharingSettings: () -> Unit = {},
    onPrivacyPolicy: () -> Unit = {}
) {
    val profileSections = listOf(
        ProfileSection(
            title = "Health Information",
            items = listOf(
                ProfileItem("Personal Details", "Age, Gender, Emergency Contact", Icons.Default.Person, onPersonalDetails),
                ProfileItem("Medical History", "Conditions, Allergies, Medications", Icons.Default.MedicalServices, onMedicalHistory),
                ProfileItem("Health Goals", "Weight, Fitness, Wellness targets", Icons.Default.FitnessCenter),
                ProfileItem("Insurance", "Coverage and provider information", Icons.Default.HealthAndSafety)
            )
        ),
        ProfileSection(
            title = "Privacy & Security",
            items = listOf(
                ProfileItem("Data Permissions", "Manage app access to health data", Icons.Default.Security, onDataPermissions),
                ProfileItem("Sharing Settings", "Control who can access your data", Icons.Default.Share, onSharingSettings),
                ProfileItem("Blockchain Wallet", "0x1234...5678", Icons.Default.AccountBalanceWallet, onBlockchainWallet),
                ProfileItem("Privacy Policy", "Review our privacy practices", Icons.Default.Policy, onPrivacyPolicy)
            )
        ),
        ProfileSection(
            title = "App Settings",
            items = listOf(
                ProfileItem("Notifications", "Manage alerts and reminders", Icons.Default.Notifications, onNotifications),
                ProfileItem("Data Sync", "Health Connect synchronization", Icons.Default.Sync, onDataSync),
                ProfileItem("Export Data", "Download your medical records", Icons.Default.Download, onExportData),
                ProfileItem("Help & Support", "Get help and contact support", Icons.Default.Help)
            )
        )
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            ProfileHeader()
        }

        profileSections.forEach { section ->
            item {
                ProfileSectionCard(section = section)
            }
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color(0xFFF44336)
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Logout,
                    contentDescription = "Logout",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Logout")
            }
        }
    }
}

@Composable
fun ProfileHeader() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 4.dp,
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Profile Avatar
            Card(
                modifier = Modifier.size(80.dp),
                shape = CircleShape,
                backgroundColor = MaterialTheme.colors.primary.copy(alpha = 0.1f)
            ) {
                Box(
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Profile",
                        modifier = Modifier.size(40.dp),
                        tint = MaterialTheme.colors.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "John Doe",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "john.doe@email.com",
                style = MaterialTheme.typography.body2,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                ProfileStat("Files", "12")
                ProfileStat("Analyses", "8")
                ProfileStat("Providers", "3")
            }
        }
    }
}

@Composable
fun ProfileStat(
    label: String,
    value: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.h6,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colors.primary
        )
        Text(
            text = label,
            style = MaterialTheme.typography.caption,
            color = Color.Gray
        )
    }
}

@Composable
fun ProfileSectionCard(section: ProfileSection) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 2.dp,
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = section.title,
                style = MaterialTheme.typography.subtitle1,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colors.primary
            )
            Spacer(modifier = Modifier.height(12.dp))

            section.items.forEachIndexed { index, item ->
                ProfileItemRow(item = item)
                if (index < section.items.size - 1) {
                    Divider(
                        modifier = Modifier.padding(vertical = 8.dp),
                        color = Color.Gray.copy(alpha = 0.2f)
                    )
                }
            }
        }
    }
}

@Composable
fun ProfileItemRow(item: ProfileItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .then(
                if (item.onClick != {}) {
                    Modifier.clickable { item.onClick() }
                } else {
                    Modifier
                }
            ),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = item.icon,
            contentDescription = item.title,
            tint = Color.Gray,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.title,
                style = MaterialTheme.typography.body1,
                fontWeight = FontWeight.Medium
            )
            item.subtitle?.let { subtitle ->
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.caption,
                    color = Color.Gray
                )
            }
        }
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = "Navigate",
            tint = Color.Gray,
            modifier = Modifier.size(20.dp)
        )
    }
}
