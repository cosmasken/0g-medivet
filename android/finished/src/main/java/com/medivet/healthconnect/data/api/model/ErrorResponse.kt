package com.medivet.healthconnect.data.api.model

import com.google.gson.annotations.SerializedName

data class ErrorResponse(
    val error: String,
    val message: String
)