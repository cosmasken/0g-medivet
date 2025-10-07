package com.medivet.healthconnect.data.api.model

import com.google.gson.annotations.SerializedName

// Medical records request models
data class CreateRecordRequest(
    @SerializedName("user_id") val userId: String,
    val title: String,
    val description: String,
    val category: String,
    val specialty: String,
    @SerializedName("priority_level") val priorityLevel: String = "medium",
    @SerializedName("file_type") val fileType: String,
    @SerializedName("file_size") val fileSize: Long,
    @SerializedName("zero_g_hash") val zeroGHash: String,
    @SerializedName("merkle_root") val merkleRoot: String,
    @SerializedName("transaction_hash") val transactionHash: String,
    val tags: List<String>,
    @SerializedName("parent_record_id") val parentRecordId: String? = null,
    @SerializedName("upload_status") val uploadStatus: String = "completed"
)

data class GetRecordsResponse(
    val records: List<MedicalRecord>
)

data class MedicalRecord(
    val id: String,
    @SerializedName("user_id") val userId: String,
    val title: String,
    val description: String,
    val category: String,
    val specialty: String,
    @SerializedName("priority_level") val priorityLevel: String,
    @SerializedName("file_type") val fileType: String,
    @SerializedName("file_size") val fileSize: Long,
    @SerializedName("zero_g_hash") val zeroGHash: String,
    @SerializedName("merkle_root") val merkleRoot: String,
    @SerializedName("transaction_hash") val transactionHash: String,
    val tags: List<String>,
    @SerializedName("parent_record_id") val parentRecordId: String?,
    @SerializedName("upload_status") val uploadStatus: String,
    @SerializedName("created_at") val createdAt: String
)