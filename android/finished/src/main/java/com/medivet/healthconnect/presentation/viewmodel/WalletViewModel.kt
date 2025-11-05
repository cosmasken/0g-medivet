package com.medivet.healthconnect.presentation.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.medivet.healthconnect.data.wallet.TransactionManager
import com.medivet.healthconnect.data.wallet.TransactionResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for managing wallet operations and transaction signing.
 */
class WalletViewModel(application: Application) : AndroidViewModel(application) {
    
    private val transactionManager = TransactionManager(application)
    
    private val _walletState = MutableStateFlow(WalletState())
    val walletState: StateFlow<WalletState> = _walletState.asStateFlow()
    
    private val _transactionState = MutableStateFlow(TransactionState())
    val transactionState: StateFlow<TransactionState> = _transactionState.asStateFlow()
    
    /**
     * Initialize wallet with user credentials.
     */
    fun initializeWallet(username: String, password: String) {
        viewModelScope.launch {
            _walletState.value = _walletState.value.copy(isLoading = true)
            
            try {
                transactionManager.initialize(username, password)
                val address = transactionManager.getWalletAddress()
                val balance = transactionManager.getBalance()
                
                _walletState.value = _walletState.value.copy(
                    isLoading = false,
                    isInitialized = true,
                    walletAddress = address,
                    balance = balance,
                    error = null
                )
            } catch (e: Exception) {
                _walletState.value = _walletState.value.copy(
                    isLoading = false,
                    error = "Failed to initialize wallet: ${e.message}"
                )
            }
        }
    }
    
    /**
     * Refresh wallet balance.
     */
    fun refreshBalance() {
        viewModelScope.launch {
            try {
                val balance = transactionManager.getBalance()
                _walletState.value = _walletState.value.copy(balance = balance)
            } catch (e: Exception) {
                _walletState.value = _walletState.value.copy(
                    error = "Failed to refresh balance: ${e.message}"
                )
            }
        }
    }
    
    /**
     * Grant provider access to a medical record.
     */
    fun grantProviderAccess(
        providerAddress: String,
        recordHash: String,
        expirationDays: Int = 30
    ) {
        viewModelScope.launch {
            _transactionState.value = _transactionState.value.copy(
                isProcessing = true,
                currentOperation = "Granting provider access..."
            )
            
            when (val result = transactionManager.grantProviderAccess(
                providerAddress, recordHash, expirationDays
            )) {
                is TransactionResult.Success -> {
                    _transactionState.value = _transactionState.value.copy(
                        isProcessing = false,
                        lastTransactionHash = result.txHash,
                        lastOperationResult = result.message,
                        error = null
                    )
                    
                    // Wait for confirmation
                    waitForConfirmation(result.txHash)
                }
                is TransactionResult.Error -> {
                    _transactionState.value = _transactionState.value.copy(
                        isProcessing = false,
                        error = result.message
                    )
                }
            }
        }
    }
    
    /**
     * Revoke provider access to a medical record.
     */
    fun revokeProviderAccess(providerAddress: String, recordHash: String) {
        viewModelScope.launch {
            _transactionState.value = _transactionState.value.copy(
                isProcessing = true,
                currentOperation = "Revoking provider access..."
            )
            
            when (val result = transactionManager.revokeProviderAccess(providerAddress, recordHash)) {
                is TransactionResult.Success -> {
                    _transactionState.value = _transactionState.value.copy(
                        isProcessing = false,
                        lastTransactionHash = result.txHash,
                        lastOperationResult = result.message,
                        error = null
                    )
                    
                    waitForConfirmation(result.txHash)
                }
                is TransactionResult.Error -> {
                    _transactionState.value = _transactionState.value.copy(
                        isProcessing = false,
                        error = result.message
                    )
                }
            }
        }
    }
    
    /**
     * Register a new medical record on blockchain.
     */
    fun registerMedicalRecord(recordHash: String, encryptedMetadata: String) {
        viewModelScope.launch {
            _transactionState.value = _transactionState.value.copy(
                isProcessing = true,
                currentOperation = "Registering medical record..."
            )
            
            when (val result = transactionManager.registerMedicalRecord(recordHash, encryptedMetadata)) {
                is TransactionResult.Success -> {
                    _transactionState.value = _transactionState.value.copy(
                        isProcessing = false,
                        lastTransactionHash = result.txHash,
                        lastOperationResult = result.message,
                        error = null
                    )
                    
                    waitForConfirmation(result.txHash)
                }
                is TransactionResult.Error -> {
                    _transactionState.value = _transactionState.value.copy(
                        isProcessing = false,
                        error = result.message
                    )
                }
            }
        }
    }
    
    /**
     * Pay storage fees for 0G Network.
     */
    fun payStorageFee(storageNodeAddress: String, feeAmountEth: String) {
        viewModelScope.launch {
            _transactionState.value = _transactionState.value.copy(
                isProcessing = true,
                currentOperation = "Paying storage fee..."
            )
            
            when (val result = transactionManager.payStorageFee(storageNodeAddress, feeAmountEth)) {
                is TransactionResult.Success -> {
                    _transactionState.value = _transactionState.value.copy(
                        isProcessing = false,
                        lastTransactionHash = result.txHash,
                        lastOperationResult = result.message,
                        error = null
                    )
                    
                    waitForConfirmation(result.txHash)
                    refreshBalance() // Update balance after payment
                }
                is TransactionResult.Error -> {
                    _transactionState.value = _transactionState.value.copy(
                        isProcessing = false,
                        error = result.message
                    )
                }
            }
        }
    }
    
    /**
     * Sign a message for authentication.
     */
    fun signMessage(message: String): String? {
        return transactionManager.signMessage(message)
    }
    
    /**
     * Clear wallet data.
     */
    fun clearWallet() {
        transactionManager.clearWallet()
        _walletState.value = WalletState()
        _transactionState.value = TransactionState()
    }
    
    /**
     * Clear error states.
     */
    fun clearErrors() {
        _walletState.value = _walletState.value.copy(error = null)
        _transactionState.value = _transactionState.value.copy(error = null)
    }
    
    /**
     * Wait for transaction confirmation and update state.
     */
    private fun waitForConfirmation(txHash: String) {
        viewModelScope.launch {
            _transactionState.value = _transactionState.value.copy(
                currentOperation = "Waiting for confirmation..."
            )
            
            val confirmed = transactionManager.waitForConfirmation(txHash)
            
            _transactionState.value = _transactionState.value.copy(
                currentOperation = null,
                isConfirmed = confirmed,
                confirmationMessage = if (confirmed) "Transaction confirmed!" else "Transaction may have failed"
            )
        }
    }
}

/**
 * State for wallet operations.
 */
data class WalletState(
    val isLoading: Boolean = false,
    val isInitialized: Boolean = false,
    val walletAddress: String? = null,
    val balance: String = "0.0",
    val error: String? = null
)

/**
 * State for transaction operations.
 */
data class TransactionState(
    val isProcessing: Boolean = false,
    val currentOperation: String? = null,
    val lastTransactionHash: String? = null,
    val lastOperationResult: String? = null,
    val isConfirmed: Boolean = false,
    val confirmationMessage: String? = null,
    val error: String? = null
)
