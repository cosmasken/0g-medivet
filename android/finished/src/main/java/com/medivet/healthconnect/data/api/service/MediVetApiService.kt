package com.medivet.healthconnect.data.api.service

import com.medivet.healthconnect.data.api.model.*
import retrofit2.Response
import retrofit2.http.*

interface MediVetApiService {
    companion object {
        const val BASE_URL = "https://medivet-backend-72tq.onrender.com/"
    }

    // Health check endpoint
    @GET("health")
    suspend fun healthCheck(): Response<HealthCheckResponse>

    // User authentication endpoints
    @POST("api/users/auth")
    suspend fun authenticateUser(@Body request: AuthRequest): Response<UserResponse>

    @POST("api/users/login")
    suspend fun loginUser(@Body request: LoginRequest): Response<LoginResponse> // Corrected to use LoginRequest

    // Medical records endpoints
    @POST("api/records")
    suspend fun createMedicalRecord(@Body request: CreateRecordRequest): Response<MedicalRecord>

    @GET("api/records/user/{userId}")
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
    @POST("api/health-connect/sync")
    suspend fun syncHealthData(@Body request: SyncHealthDataRequest): Response<SyncHealthDataResponse>

    @GET("api/health-connect/user/{userId}")
    suspend fun getHealthData(
        @Path("userId") userId: String,
        @Query("limit") limit: Int? = null,
        @Query("offset") offset: Int? = null,
        @Query("data_type") dataType: String? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("source_app") sourceApp: String? = null
    ): Response<GetHealthDataResponse>

    @GET("api/health-connect/user/{userId}/stats")
    suspend fun getHealthStats(
        @Path("userId") userId: String,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("data_type") dataType: String? = null
    ): Response<HealthStatsResponse>

    @GET("api/health-connect/user/{userId}/summary")
    suspend fun getHealthDataSummary(@Path("userId") userId: String): Response<DataSummaryResponse>

    @DELETE("api/health-connect/user/{userId}")
    suspend fun deleteHealthData(
        @Path("userId") userId: String,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("data_type") dataType: String? = null
    ): Response<SyncHealthDataResponse>

    // Compute services endpoints
    @POST("api/compute/analyze")
    suspend fun analyzeMedicalData(@Body request: ComputeAnalysisRequest): Response<ComputeAnalysisResponse>

    @GET("api/compute/jobs/{jobId}")
    suspend fun getJobStatus(@Path("jobId") jobId: String): Response<JobStatusResponse>

    @GET("api/compute/balance")
    suspend fun getComputeBalance(): Response<ComputeBalanceResponse>

    @GET("api/compute/services")
    suspend fun getComputeServices(): Response<ComputeServicesResponse>
}