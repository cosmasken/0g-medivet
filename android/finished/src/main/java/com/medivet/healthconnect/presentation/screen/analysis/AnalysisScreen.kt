package com.medivet.healthconnect.presentation.screen.analysis

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

data class AnalysisResult(
    val id: String,
    val fileName: String,
    val analysisType: String,
    val date: String,
    val confidence: Float,
    val findings: List<Finding>,
    val recommendations: List<String>
)

data class Finding(
    val title: String,
    val description: String,
    val severity: Severity,
    val icon: ImageVector
)

enum class Severity(val displayName: String, val color: Color) {
    NORMAL("Normal", Color(0xFF4CAF50)),
    ATTENTION("Needs Attention", Color(0xFFFF9800)),
    URGENT("Urgent", Color(0xFFF44336))
}

@Composable
fun AnalysisScreen(
    modifier: Modifier = Modifier,
    onGenerateAnalysis: () -> Unit = {}
) {
    val analysisResults = remember {
        listOf(
            AnalysisResult(
                id = "1",
                fileName = "Blood Test Results - March 2024",
                analysisType = "Privacy-Preserving Analysis",
                date = "2 days ago",
                confidence = 0.94f,
                findings = listOf(
                    Finding("Glucose Level", "Normal range (85 mg/dL)", Severity.NORMAL, Icons.Default.CheckCircle),
                    Finding("Cholesterol", "Slightly elevated (210 mg/dL)", Severity.ATTENTION, Icons.Default.Warning),
                    Finding("Hemoglobin", "Within normal limits", Severity.NORMAL, Icons.Default.CheckCircle)
                ),
                recommendations = listOf(
                    "Consider dietary changes to reduce cholesterol",
                    "Continue current medication regimen",
                    "Schedule follow-up in 3 months"
                )
            ),
            AnalysisResult(
                id = "2",
                fileName = "Chest X-Ray",
                analysisType = "Encrypted Analysis",
                date = "1 week ago",
                confidence = 0.89f,
                findings = listOf(
                    Finding("Lung Fields", "Clear bilateral lung fields", Severity.NORMAL, Icons.Default.CheckCircle),
                    Finding("Heart Size", "Normal cardiac silhouette", Severity.NORMAL, Icons.Default.CheckCircle),
                    Finding("Bone Structure", "No acute fractures visible", Severity.NORMAL, Icons.Default.CheckCircle)
                ),
                recommendations = listOf(
                    "No immediate action required",
                    "Continue regular health monitoring"
                )
            ),
            AnalysisResult(
                id = "3",
                fileName = "ECG Report",
                analysisType = "Zero-Knowledge Analysis",
                date = "5 days ago",
                confidence = 0.91f,
                findings = listOf(
                    Finding("Heart Rhythm", "Normal sinus rhythm", Severity.NORMAL, Icons.Default.CheckCircle),
                    Finding("Heart Rate", "72 BPM - Normal", Severity.NORMAL, Icons.Default.CheckCircle),
                    Finding("ST Segment", "Minor elevation in lead II", Severity.ATTENTION, Icons.Default.Warning)
                ),
                recommendations = listOf(
                    "Monitor for symptoms",
                    "Consider stress test if symptoms persist",
                    "Follow up with cardiologist"
                )
            )
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
                text = "AI Analysis Results",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Powered by 0G Compute Network",
                style = MaterialTheme.typography.caption,
                color = Color.Gray
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Analysis Summary",
                        style = MaterialTheme.typography.h6,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        SummaryItem("Total Files", "6", Icons.Default.Description)
                        SummaryItem("Analyzed", "3", Icons.Default.Analytics)
                        SummaryItem("Normal", "8", Icons.Default.CheckCircle)
                        SummaryItem("Attention", "2", Icons.Default.Warning)
                    }
                }
            }
        }

        item {
            Button(
                onClick = onGenerateAnalysis,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.secondary)
            ) {
                Icon(
                    imageVector = Icons.Default.Psychology,
                    contentDescription = "Generate Analysis",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Generate New Analysis")
            }
        }

        items(analysisResults) { result ->
            AnalysisResultCard(result = result)
        }
    }
}

@Composable
fun SummaryItem(
    title: String,
    value: String,
    icon: ImageVector
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = title,
            tint = MaterialTheme.colors.primary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.h6,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = title,
            style = MaterialTheme.typography.caption,
            color = Color.Gray
        )
    }
}

@Composable
fun AnalysisResultCard(result: AnalysisResult) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 4.dp,
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = result.fileName,
                        style = MaterialTheme.typography.subtitle1,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${result.analysisType} • ${result.date}",
                        style = MaterialTheme.typography.caption,
                        color = Color.Gray
                    )
                }
                
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Confidence",
                        style = MaterialTheme.typography.caption,
                        color = Color.Gray
                    )
                    Text(
                        text = "${(result.confidence * 100).toInt()}%",
                        style = MaterialTheme.typography.subtitle2,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colors.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Key Findings",
                style = MaterialTheme.typography.subtitle2,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))

            result.findings.forEach { finding ->
                FindingItem(finding = finding)
                Spacer(modifier = Modifier.height(8.dp))
            }

            if (result.recommendations.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Recommendations",
                    style = MaterialTheme.typography.subtitle2,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))

                result.recommendations.forEach { recommendation ->
                    Row(
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            imageVector = Icons.Default.Circle,
                            contentDescription = null,
                            modifier = Modifier.size(6.dp),
                            tint = Color.Gray
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = recommendation,
                            style = MaterialTheme.typography.body2,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                }
            }
        }
    }
}

@Composable
fun FindingItem(finding: Finding) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = finding.icon,
            contentDescription = finding.severity.displayName,
            tint = finding.severity.color,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = finding.title,
                style = MaterialTheme.typography.body2,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = finding.description,
                style = MaterialTheme.typography.caption,
                color = Color.Gray
            )
        }
        Card(
            modifier = Modifier.clip(RoundedCornerShape(16.dp)),
            backgroundColor = finding.severity.color.copy(alpha = 0.1f),
            elevation = 0.dp
        ) {
            Text(
                text = finding.severity.displayName,
                color = finding.severity.color,
                style = MaterialTheme.typography.caption,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}
