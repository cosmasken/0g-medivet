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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun GenerateAnalysisScreen(
    modifier: Modifier = Modifier,
    onAnalysisComplete: () -> Unit = {}
) {
    var selectedFiles by remember { mutableStateOf(setOf<String>()) }
    var isGenerating by remember { mutableStateOf(false) }
    var generationProgress by remember { mutableStateOf(0f) }
    var currentStep by remember { mutableStateOf("") }

    val availableFiles = remember {
        listOf(
            "Blood Test Results - March 2024" to "1",
            "Chest X-Ray" to "2", 
            "ECG Report" to "6",
            "Ultrasound Abdomen" to "7",
            "Allergy Test Results" to "8"
        )
    }

    val analysisSteps = listOf(
        "Encrypting files for 0G Standard Storage...",
        "Initializing privacy-preserving analysis...",
        "Processing data with zero-knowledge proofs...",
        "Analyzing patterns while preserving privacy...",
        "Generating insights with end-to-end encryption...",
        "Finalizing secure analysis report..."
    )

    LaunchedEffect(isGenerating) {
        if (isGenerating) {
            analysisSteps.forEachIndexed { index, step ->
                currentStep = step
                generationProgress = (index + 1) / analysisSteps.size.toFloat()
                kotlinx.coroutines.delay(1500)
            }
            kotlinx.coroutines.delay(1000)
            onAnalysisComplete()
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
                text = "Generate AI Analysis",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Powered by 0G Compute Network",
                style = MaterialTheme.typography.caption,
                color = Color.Gray
            )
        }

        if (!isGenerating) {
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
                            text = "Select Files for Analysis",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Choose medical files to include in the AI analysis",
                            style = MaterialTheme.typography.caption,
                            color = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        availableFiles.forEach { (fileName, fileId) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = selectedFiles.contains(fileId),
                                    onCheckedChange = { checked ->
                                        selectedFiles = if (checked) {
                                            selectedFiles + fileId
                                        } else {
                                            selectedFiles - fileId
                                        }
                                    }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(
                                    imageVector = Icons.Default.Description,
                                    contentDescription = null,
                                    tint = MaterialTheme.colors.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = fileName,
                                    style = MaterialTheme.typography.body2
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
                            text = "Analysis Options",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(checked = true, onCheckedChange = { })
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Comprehensive Health Analysis", style = MaterialTheme.typography.body2)
                        }
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(checked = true, onCheckedChange = { })
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Risk Assessment", style = MaterialTheme.typography.body2)
                        }
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(checked = false, onCheckedChange = { })
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Treatment Recommendations", style = MaterialTheme.typography.body2)
                        }
                    }
                }
            }

            item {
                Button(
                    onClick = { isGenerating = true },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = selectedFiles.isNotEmpty()
                ) {
                    Icon(Icons.Default.Psychology, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Generate Analysis (${selectedFiles.size} files)")
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
                            imageVector = Icons.Default.Security,
                            contentDescription = "Privacy Processing",
                            tint = MaterialTheme.colors.primary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "Privacy-Preserving Analysis in Progress",
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = currentStep,
                            style = MaterialTheme.typography.body2,
                            color = Color.Gray
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        LinearProgressIndicator(
                            progress = generationProgress,
                            modifier = Modifier.fillMaxWidth()
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "${(generationProgress * 100).toInt()}% Complete",
                            style = MaterialTheme.typography.caption,
                            color = Color.Gray
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
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Processing Details",
                            style = MaterialTheme.typography.subtitle1,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text("• Files selected: ${selectedFiles.size}", style = MaterialTheme.typography.body2)
                        Text("• Privacy Method: Zero-Knowledge Proofs", style = MaterialTheme.typography.body2)
                        Text("• Compute Network: 0G Galileo Testnet", style = MaterialTheme.typography.body2)
                        Text("• Storage: 0G Standard Storage (Encrypted)", style = MaterialTheme.typography.body2)
                    }
                }
            }
        }
    }
}
