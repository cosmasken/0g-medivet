package com.medivet.healthconnect.data.api.model

import com.google.gson.annotations.SerializedName

// Compute/Analysis models
data class ComputeAnalysisRequest(
    @SerializedName("fileData") val fileData: FileData,
    @SerializedName("analysisType") val analysisType: String,
    @SerializedName("userId") val userId: String,
    @SerializedName("fileId") val fileId: String
)

data class FileData(
    val name: String,
    val age: Int,
    val medications: List<String>,
    val diagnosis: String,
    @SerializedName("lab_results") val labResults: Map<String, Any>
)

data class ComputeAnalysisResponse(
    val success: Boolean,
    @SerializedName("jobId") val jobId: String,
    val analysis: String,
    @SerializedName("isValid") val isValid: Boolean,
    val provider: String,
    val timestamp: String,
    @SerializedName("computeTime") val computeTime: Int
)

data class JobStatusResponse(
    @SerializedName("jobId") val jobId: String,
    val status: String,
    val result: String?
)

data class ComputeBalanceResponse(
    val balance: Double
)

data class ComputeServicesResponse(
    val services: List<ComputeService>
)

data class ComputeService(
    val id: String,
    val name: String,
    val description: String,
    val cost: Double
)