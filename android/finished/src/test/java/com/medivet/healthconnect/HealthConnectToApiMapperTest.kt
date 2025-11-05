package com.medivet.healthconnect

import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.records.metadata.DataOrigin
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.units.Mass
import com.medivet.healthconnect.data.HealthConnectToApiMapper
import org.junit.Test
import org.junit.Assert.*
import java.time.Instant
import java.time.ZoneOffset

class HealthConnectToApiMapperTest {

    @Test
    fun `mapToApiFormat converts StepsRecord to HealthDataPoint correctly`() {
        // Create sample StepsRecord
        val startTime = Instant.now()
        val endTime = startTime.plusSeconds(3600) // 1 hour later
        val stepsRecord = StepsRecord(
            metadata = Metadata(
                id = "test_id",
                dataOrigin = DataOrigin("com.example.app")
            ),
            startTime = startTime,
            startZoneOffset = ZoneOffset.UTC,
            endTime = endTime,
            endZoneOffset = ZoneOffset.UTC,
            count = 5000L
        )

        val userId = "test_user_id"
        val request = HealthConnectToApiMapper.mapToApiFormat(listOf(stepsRecord), userId)

        // Verify the request
        assertEquals(userId, request.userId)
        assertEquals(1, request.healthData.size)
        
        val healthDataPoint = request.healthData[0]
        assertEquals("steps", healthDataPoint.dataType)
        assertEquals(5000L, healthDataPoint.value)
        assertEquals("count", healthDataPoint.unit)
    }

    @Test
    fun `mapToApiFormat converts WeightRecord to HealthDataPoint correctly`() {
        // Create sample WeightRecord
        val time = Instant.now()
        val weightRecord = WeightRecord(
            metadata = Metadata(
                id = "test_id",
                dataOrigin = DataOrigin("com.example.app")
            ),
            time = time,
            zoneOffset = ZoneOffset.UTC,
            weight = Mass.kilograms(70.0)
        )

        val userId = "test_user_id"
        val request = HealthConnectToApiMapper.mapToApiFormat(listOf(weightRecord), userId)

        // Verify the request
        assertEquals(userId, request.userId)
        assertEquals(1, request.healthData.size)
        
        val healthDataPoint = request.healthData[0]
        assertEquals("weight", healthDataPoint.dataType)
        assertEquals(70.0, healthDataPoint.value as Double, 0.01)
        assertEquals("kilograms", healthDataPoint.unit)
    }

    @Test
    fun `mapToApiFormat handles multiple record types correctly`() {
        // Create sample records
        val startTime = Instant.now()
        val endTime = startTime.plusSeconds(3600)
        val stepsRecord = StepsRecord(
            metadata = Metadata(
                id = "test_id",
                dataOrigin = DataOrigin("com.example.app")
            ),
            startTime = startTime,
            startZoneOffset = ZoneOffset.UTC,
            endTime = endTime,
            endZoneOffset = ZoneOffset.UTC,
            count = 5000L
        )

        val weightTime = Instant.now().plusSeconds(1800) // 30 min after start time
        val weightRecord = WeightRecord(
            metadata = Metadata(
                id = "test_weight_id",
                dataOrigin = DataOrigin("com.example.app")
            ),
            time = weightTime,
            zoneOffset = ZoneOffset.UTC,
            weight = Mass.kilograms(75.0)
        )

        val userId = "test_user_id"
        val request = HealthConnectToApiMapper.mapToApiFormat(listOf(stepsRecord, weightRecord), userId)

        // Verify the request
        assertEquals(userId, request.userId)
        assertEquals(2, request.healthData.size)
        
        // Check that we have both steps and weight records
        val dataTypes = request.healthData.map { it.dataType }
        assertTrue(dataTypes.contains("steps"))
        assertTrue(dataTypes.contains("weight"))
    }
}