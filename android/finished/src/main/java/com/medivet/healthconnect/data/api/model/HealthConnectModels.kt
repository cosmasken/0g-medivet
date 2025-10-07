package com.medivet.healthconnect.data.api.model

import com.google.gson.annotations.SerializedName

// Health Connect sync models
data class SyncHealthDataRequest(
    @SerializedName("user_id") val userId: String,
    @SerializedName("health_data") val healthData: List<HealthDataPoint>
)

data class HealthDataPoint(
    @SerializedName("data_type") val dataType: String,
    @SerializedName("start_time") val startTime: String,
    @SerializedName("end_time") val endTime: String,
    val value: Any,
    val unit: String,
    @SerializedName("source_app") val sourceApp: String,
    @SerializedName("source_device") val sourceDevice: String,
    val metadata: Map<String, Any>
)

data class SyncHealthDataResponse(
    val success: Boolean,
    val message: String,
    @SerializedName("synced_count") val syncedCount: Int
)

data class GetHealthDataResponse(
    @SerializedName("health_data") val healthData: List<HealthDataPoint>,
    @SerializedName("total_count") val totalCount: Int
)

data class HealthStatsResponse(
    val stats: Map<String, Any>
)

data class DataSummaryResponse(
    val summary: Map<String, Any>
)