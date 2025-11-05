package com.medivet.healthconnect.presentation.screen.exercisesession

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.metadata.Metadata
import com.medivet.healthconnect.R
import com.medivet.healthconnect.presentation.component.ExerciseSessionRow
import com.medivet.healthconnect.presentation.theme.HealthConnectTheme
import java.time.ZonedDateTime
import java.util.UUID

@Composable
fun ExerciseSessionScreen(
    permissions: Set<String>,
    permissionsGranted: Boolean,
    sessionsList: List<ExerciseSessionRecord>,
    uiState: ExerciseSessionViewModel.UiState,
    onInsertClick: () -> Unit = {},
    onDetailsClick: (String) -> Unit = {},
    onError: (Throwable?) -> Unit = {},
    onPermissionsResult: () -> Unit = {},
    onPermissionsLaunch: (Set<String>) -> Unit = {},
    onLogoutClick: () -> Unit = {}
) {
    val errorId = rememberSaveable { mutableStateOf(UUID.randomUUID()) }

    LaunchedEffect(uiState) {
        if (uiState is ExerciseSessionViewModel.UiState.Uninitialized) {
            onPermissionsResult()
        }

        if (uiState is ExerciseSessionViewModel.UiState.Error && errorId.value != uiState.uuid) {
            onError(uiState.exception)
            errorId.value = uiState.uuid
        }
    }

    if (uiState != ExerciseSessionViewModel.UiState.Uninitialized) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    Button(
                        onClick = onLogoutClick,
                        modifier = Modifier.padding(8.dp)
                    ) {
                        Text("Logout")
                    }
                }
            }
            if (!permissionsGranted) {
                item {
                    Button(
                        onClick = { onPermissionsLaunch(permissions) }
                    ) {
                        Text(text = stringResource(R.string.permissions_button_label))
                    }
                }
            } else {
                item {
                    Button(
                        modifier = Modifier.fillMaxWidth().height(48.dp).padding(4.dp),
                        onClick = { onInsertClick() }
                    ) {
                        Text(stringResource(id = R.string.insert_exercise_session))
                    }
                }
                items(sessionsList) { session ->
                    ExerciseSessionRow(
                        ZonedDateTime.ofInstant(session.startTime, session.startZoneOffset),
                        ZonedDateTime.ofInstant(session.endTime, session.endZoneOffset),
                        session.metadata.id,
                        session.metadata.dataOrigin.packageName,
                        session.title ?: stringResource(R.string.no_title),
                        onDetailsClick = { uid -> onDetailsClick(uid) }
                    )
                }
            }
        }
    }
}

@Preview
@Composable
fun ExerciseSessionScreenPreview() {
    HealthConnectTheme {
        val runningStartTime = ZonedDateTime.now()
        val runningEndTime = runningStartTime.plusMinutes(30)
        val walkingStartTime = ZonedDateTime.now().minusMinutes(120)
        val walkingEndTime = walkingStartTime.plusMinutes(30)

        ExerciseSessionScreen(
            permissions = setOf(),
            permissionsGranted = true,
            sessionsList = listOf(
                ExerciseSessionRecord(
                    metadata = Metadata.manualEntryWithId(UUID.randomUUID().toString()),
                    exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_RUNNING,
                    title = "Running",
                    startTime = runningStartTime.toInstant(),
                    startZoneOffset = runningStartTime.offset,
                    endTime = runningEndTime.toInstant(),
                    endZoneOffset = runningEndTime.offset,
                ),
                ExerciseSessionRecord(
                    metadata = Metadata.manualEntryWithId(UUID.randomUUID().toString()),
                    exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_WALKING,
                    title = "Walking",
                    startTime = walkingStartTime.toInstant(),
                    startZoneOffset = walkingStartTime.offset,
                    endTime = walkingEndTime.toInstant(),
                    endZoneOffset = walkingEndTime.offset,
                )
            ),
            uiState = ExerciseSessionViewModel.UiState.Done
        )
    }
}
