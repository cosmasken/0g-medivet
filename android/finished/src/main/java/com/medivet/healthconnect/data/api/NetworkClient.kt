package com.medivet.healthconnect.data.api

import android.util.Log
import com.medivet.healthconnect.data.api.service.MediVetApiService
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkClient {
    private const val BASE_URL = MediVetApiService.BASE_URL
    private const val TAG = "NetworkClient"

    private val loggingInterceptor = HttpLoggingInterceptor(object : HttpLoggingInterceptor.Logger {
        override fun log(message: String) {
            Log.d(TAG, message)
        }
    }).apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val httpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            try {
                val request = chain.request()
                Log.d(TAG, "Making request to: ${request.url}")
                val response = chain.proceed(request)
                if (!response.isSuccessful) {
                    val errorBody = response.peekBody(Long.MAX_VALUE).string()
                    Log.e(TAG, "Request failed with code ${response.code} and body: $errorBody")
                } else {
                    Log.d(TAG, "Received response with code: ${response.code}")
                }
                response
            } catch (e: Exception) {
                Log.e(TAG, "Network request failed: ${e.message}", e)
                throw e
            }
        }
        .connectTimeout(45, TimeUnit.SECONDS)
        .readTimeout(45, TimeUnit.SECONDS)
        .writeTimeout(45, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(httpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: MediVetApiService by lazy {
        retrofit.create(MediVetApiService::class.java)
    }
}