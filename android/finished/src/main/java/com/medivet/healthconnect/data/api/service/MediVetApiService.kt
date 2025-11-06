package com.medivet.healthconnect.data.api.service

import com.medivet.healthconnect.data.api.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface MediVetApiService {
    companion object {
        const val BASE_URL = "https://medivet.paymebro.xyz/api/"
    }

    // Health check endpoint
    @GET("health")
    suspend fun healthCheck(): Response<HealthCheckResponse>

    // User authentication endpoints
    @POST("users/auth")
    suspend fun authenticateUser(@Body request: AuthRequest): Response<UserResponse>

    // Mobile authentication with username/password
    @POST("users/auth")
    suspend fun authenticateWithCredentials(@Body request: CredentialAuthRequest): Response<UserResponse>

    // Check username availability
    @GET("users/check-username/{username}")
    suspend fun checkUsername(@Path("username") username: String): Response<UsernameCheckResponse>

    // Medical records endpoints
    @POST("records")
    suspend fun createMedicalRecord(@Body request: CreateRecordRequest): Response<MedicalRecord>

    // File upload endpoint
    @Multipart
    @POST("upload")
    suspend fun uploadFile(
        @Part("metadata") metadata: RequestBody,
        @Part file: MultipartBody.Part
    ): Response<UploadResponse>

    @GET("records/user/{userId}")
    suspend fun getUserRecords(
        @Path("userId") userId: String,
        @Query("limit") limit: Int? = null,
        @Query("offset") offset: Int? = null,
        @Query("category") category: String? = null,
        @Query("specialty") specialty: String? = null,
        @Query("priority_level") priorityLevel: String? = null,
        @Query("tags") tags: String? = null,
        @Query("search") search: String? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
        @Query("include_versions") includeVersions: Boolean? = null
    ): Response<GetRecordsResponse>

    // Health Connect integration endpoints
    @POST("health-connect/sync")
    suspend fun syncHealthData(@Body request: SyncHealthDataRequest): Response<SyncHealthDataResponse>

    @GET("health-connect/user/{userId}")
    suspend fun getHealthData(
        @Path("userId") userId: String,
        @Query("limit") limit: Int? = null,
        @Query("offset") offset: Int? = null,
        @Query("data_type") dataType: String? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("source_app") sourceApp: String? = null
    ): Response<GetHealthDataResponse>

    @GET("health-connect/user/{userId}/stats")
    suspend fun getHealthStats(
        @Path("userId") userId: String,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("data_type") dataType: String? = null
    ): Response<HealthStatsResponse>

    @GET("health-connect/user/{userId}/summary")
    suspend fun getHealthDataSummary(@Path("userId") userId: String): Response<DataSummaryResponse>

    @DELETE("health-connect/user/{userId}")
    suspend fun deleteHealthData(
        @Path("userId") userId: String,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("data_type") dataType: String? = null
    ): Response<SyncHealthDataResponse>

    // File download endpoints
    @Streaming
    @GET("download/stream/{rootHash}")
    suspend fun downloadFileStream(
        @Path("rootHash") rootHash: String,
        @Query("networkType") networkType: String = "standard",
        @Query("filename") filename: String
    ): Response<okhttp3.ResponseBody>

    @GET("download/verify/{rootHash}")
    suspend fun verifyFile(
        @Path("rootHash") rootHash: String,
        @Query("networkType") networkType: String = "standard"
    ): Response<FileVerificationResponse>

    @GET("download/metadata/{rootHash}")
    suspend fun getFileMetadata(
        @Path("rootHash") rootHash: String,
        @Query("networkType") networkType: String = "standard"
    ): Response<FileMetadataResponse>
}