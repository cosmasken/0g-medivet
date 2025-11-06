package com.medivet.healthconnect.data

import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.units.Energy
import androidx.health.connect.client.units.Mass
import com.medivet.healthconnect.data.api.model.HealthDataPoint
import com.medivet.healthconnect.data.api.model.SyncHealthDataRequest
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/**
 * Utility functions to map Health Connect data records to API format.
 */
object HealthConnectToApiMapper {

    private val isoFormatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME

    fun mapToApiFormat(records: List<Record>, userId: String): SyncHealthDataRequest {
        val healthDataPoints = records.flatMap { record ->
            when (record) {
                is StepsRecord -> mapStepsRecord(record)
                is HeartRateRecord -> mapHeartRateRecord(record)
                is TotalCaloriesBurnedRecord -> mapCaloriesRecord(record)
                is WeightRecord -> mapWeightRecord(record)
                is ExerciseSessionRecord -> mapExerciseSessionRecord(record)
                else -> emptyList() // Other record types not supported yet
            }
        }

        return SyncHealthDataRequest(
            userId = userId,
            healthData = healthDataPoints
        )
    }

    private fun mapStepsRecord(record: StepsRecord): List<HealthDataPoint> {
        val dataPoints = mutableListOf<HealthDataPoint>()
        
        // Add total steps for the period
        if (record.count != null) {
            dataPoints.add(
                HealthDataPoint(
                    dataType = "steps",
                    // Using toString() since steps records might not have zoneOffset
                    startTime = record.startTime.toString(),
                    // Using toString() since steps records might not have zoneOffset
                    endTime = record.endTime.toString(),
                    value = record.count ?: 0L,
                    unit = "count",
                    sourceApp = record.metadata.dataOrigin.packageName,
                    sourceDevice = record.metadata.device?.model ?: "Unknown",
                    metadata = mapOf(
                        "source" to "HealthConnect",
                        "dataOrigin" to record.metadata.dataOrigin.packageName
                    )
                )
            )
        }

        return dataPoints
    }

    private fun mapHeartRateRecord(record: HeartRateRecord): List<HealthDataPoint> {
        val dataPoints = mutableListOf<HealthDataPoint>()
        
        // Add heart rate samples
        record.samples.forEach { sample ->
            dataPoints.add(
                HealthDataPoint(
                    dataType = "heart_rate",
                    startTime = sample.time.atZone(ZoneId.systemDefault()).format(isoFormatter),
                    endTime = sample.time.atZone(ZoneId.systemDefault()).format(isoFormatter),
                    value = sample.beatsPerMinute.toDouble(),
                    unit = "bpm",
                    sourceApp = record.metadata.dataOrigin.packageName,
                    sourceDevice = record.metadata.device?.model ?: "Unknown",
                    metadata = mapOf(
                        "source" to "HealthConnect",
                        "dataOrigin" to record.metadata.dataOrigin.packageName
                    )
                )
            )
        }

        return dataPoints
    }

    private fun mapCaloriesRecord(record: TotalCaloriesBurnedRecord): List<HealthDataPoint> {
        val dataPoints = mutableListOf<HealthDataPoint>()
        
        // Add calories burned for the period
        dataPoints.add(
            HealthDataPoint(
                dataType = "calories_burned",
                startTime = record.startTime.toString(),
                endTime = record.endTime.toString(),
                value = record.energy.inCalories,
                unit = "calories",
                sourceApp = record.metadata.dataOrigin.packageName,
                sourceDevice = record.metadata.device?.model ?: "Unknown",
                metadata = mapOf(
                    "source" to "HealthConnect",
                    "dataOrigin" to record.metadata.dataOrigin.packageName
                )
            )
        )

        return dataPoints
    }

    private fun mapWeightRecord(record: WeightRecord): List<HealthDataPoint> {
        val dataPoints = mutableListOf<HealthDataPoint>()
        
        // Add weight measurement
        dataPoints.add(
            HealthDataPoint(
                dataType = "weight",
                startTime = record.time.toString(),
                endTime = record.time.toString(), // Same as start for point-in-time measurements
                value = record.weight.inKilograms,
                unit = "kilograms",
                sourceApp = record.metadata.dataOrigin.packageName,
                sourceDevice = record.metadata.device?.model ?: "Unknown",
                metadata = mapOf(
                    "source" to "HealthConnect",
                    "dataOrigin" to record.metadata.dataOrigin.packageName
                )
            )
        )

        return dataPoints
    }

    private fun mapExerciseSessionRecord(record: ExerciseSessionRecord): List<HealthDataPoint> {
        val dataPoints = mutableListOf<HealthDataPoint>()
        
        // Add exercise session
        dataPoints.add(
            HealthDataPoint(
                dataType = "exercise_session",
                startTime = record.startTime.toString(),
                endTime = record.endTime.toString(),
                value = mapOf(
                    "type" to mapExerciseType(record.exerciseType),
                    "title" to (record.title ?: "Exercise Session")
                ),
                unit = "session",
                sourceApp = record.metadata.dataOrigin.packageName,
                sourceDevice = record.metadata.device?.model ?: "Unknown",
                metadata = mapOf(
                    "source" to "HealthConnect",
                    "dataOrigin" to record.metadata.dataOrigin.packageName
                )
            )
        )

        return dataPoints
    }

    private fun mapExerciseType(exerciseType: Int): String {
        return when (exerciseType) {
            1 -> "archery"  // Assuming these are the constant values
            2 -> "badminton"
            3 -> "baseball"
            4 -> "basketball"
            5 -> "biking"
            6 -> "stationary_biking"
            7 -> "boot_camp"
            8 -> "boxing"
            9 -> "calisthenics"
            10 -> "cricket"
            11 -> "crossfit"
            12 -> "curling"
            13 -> "dancing"
            14 -> "diving"
            15 -> "elliptical"
            16 -> "fencing"
            17 -> "american_football"
            18 -> "australian_football"
            19 -> "frisbee"
            20 -> "golf"
            21 -> "breathing_exercise"
            22 -> "gymnastics"
            23 -> "handball"
            24 -> "hiit"
            25 -> "hiking"
            26 -> "hockey"
            27 -> "horseback_riding"
            28 -> "housework"
            29 -> "jumping_rope"
            30 -> "kickboxing"
            31 -> "kite_surfing"
            32 -> "martial_arts"
            33 -> "meditation"
            34 -> "martial_arts_mixed"
            35 -> "paddling"
            36 -> "paragliding"
            37 -> "pilates"
            38 -> "racquetball"
            39 -> "rock_climbing"
            40 -> "rowing"
            41 -> "rowing_machine"
            42 -> "rugby"
            43 -> "running"
            44 -> "treadmill_running"
            45 -> "sailing"
            46 -> "skating"
            47 -> "skiing"
            48 -> "snowboarding"
            49 -> "snow_shoeing"
            50 -> "soccer"
            51 -> "softball"
            52 -> "squash"
            53 -> "stair_climbing"
            54 -> "stair_climbing_machine"
            55 -> "stretching"
            56 -> "surfing"
            57 -> "open_water_swimming"
            58 -> "pool_swimming"
            59 -> "table_tennis"
            60 -> "tennis"
            61 -> "unknown"
            62 -> "volleyball"
            63 -> "walking"
            64 -> "water_polo"
            65 -> "weight_training"
            66 -> "yoga"
            else -> "other"
        }
    }
}