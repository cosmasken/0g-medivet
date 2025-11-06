package com.medivet.healthconnect.data.wallet

import android.content.Context
import com.medivet.healthconnect.util.SharedPreferencesHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.protocol.Web3j
import org.web3j.protocol.core.methods.response.TransactionReceipt
import org.web3j.protocol.http.HttpService
import java.math.BigInteger

/**
 * Manages transaction operations for the mobile app.
 * Provides high-level interface for signing and sending transactions.
 */
class TransactionManager(private val context: Context) {
    
    private val walletService = WalletService()
    private val transactionBuilder = ZeroGTransactionBuilder()
    private val sharedPrefs = SharedPreferencesHelper.getInstance(context)
    
    private val web3j: Web3j by lazy {
        Web3j.build(HttpService("https://evmrpc-testnet.0g.ai"))
    }
    
    /**
     * Initialize the transaction manager with user credentials.
     */
    suspend fun initialize(username: String, password: String) = withContext(Dispatchers.IO) {
        walletService.initializeWallet(username, password)
        
        // Store wallet address for future reference
        walletService.getWalletAddress()?.let { address ->
            sharedPrefs.saveWalletAddress(address)
        }
    }
    
    /**
     * Get the current wallet address.
     */
    fun getWalletAddress(): String? {
        return walletService.getWalletAddress() ?: sharedPrefs.getWalletAddress()
    }
    
    /**
     * Get wallet balance in ETH.
     */
    suspend fun getBalance(): String = withContext(Dispatchers.IO) {
        val balanceWei = walletService.getBalance()
        walletService.weiToEth(balanceWei)
    }
    
    /**
     * Grant provider access to a medical record.
     */
    suspend fun grantProviderAccess(
        providerAddress: String,
        recordHash: String,
        expirationDays: Int = 30
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            val expirationTimestamp = System.currentTimeMillis() / 1000 + 
                (expirationDays * 24 * 60 * 60)
            
            val txData = transactionBuilder.buildGrantAccessTransaction(
                providerAddress,
                recordHash,
                expirationTimestamp
            )
            
            val signedTx = walletService.signTransaction(
                to = txData.to,
                value = txData.value,
                data = txData.data,
                gasLimit = txData.gasLimit,
                gasPrice = txData.gasPrice
            )
            
            val txHash = web3j.ethSendRawTransaction(signedTx).send().transactionHash
            
            TransactionResult.Success(txHash, "Provider access granted successfully")
        } catch (e: Exception) {
            TransactionResult.Error("Failed to grant access: ${e.message}")
        }
    }
    
    /**
     * Revoke provider access to a medical record.
     */
    suspend fun revokeProviderAccess(
        providerAddress: String,
        recordHash: String
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            val txData = transactionBuilder.buildRevokeAccessTransaction(
                providerAddress,
                recordHash
            )
            
            val signedTx = walletService.signTransaction(
                to = txData.to,
                value = txData.value,
                data = txData.data,
                gasLimit = txData.gasLimit,
                gasPrice = txData.gasPrice
            )
            
            val txHash = web3j.ethSendRawTransaction(signedTx).send().transactionHash
            
            TransactionResult.Success(txHash, "Provider access revoked successfully")
        } catch (e: Exception) {
            TransactionResult.Error("Failed to revoke access: ${e.message}")
        }
    }
    
    /**
     * Register a new medical record on the blockchain.
     */
    suspend fun registerMedicalRecord(
        recordHash: String,
        encryptedMetadata: String
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            val txData = transactionBuilder.buildRegisterRecordTransaction(
                recordHash,
                encryptedMetadata
            )
            
            val signedTx = walletService.signTransaction(
                to = txData.to,
                value = txData.value,
                data = txData.data,
                gasLimit = txData.gasLimit,
                gasPrice = txData.gasPrice
            )
            
            val txHash = web3j.ethSendRawTransaction(signedTx).send().transactionHash
            
            TransactionResult.Success(txHash, "Medical record registered successfully")
        } catch (e: Exception) {
            TransactionResult.Error("Failed to register record: ${e.message}")
        }
    }
    
    /**
     * Pay storage fees for 0G Network.
     */
    suspend fun payStorageFee(
        storageNodeAddress: String,
        feeAmountEth: String
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            val feeAmountWei = org.web3j.utils.Convert.toWei(
                feeAmountEth, 
                org.web3j.utils.Convert.Unit.ETHER
            ).toBigInteger()
            
            val txData = transactionBuilder.buildStorageFeeTransaction(
                storageNodeAddress,
                feeAmountWei
            )
            
            val signedTx = walletService.signTransaction(
                to = txData.to,
                value = txData.value,
                data = txData.data,
                gasLimit = txData.gasLimit,
                gasPrice = txData.gasPrice
            )
            
            val txHash = web3j.ethSendRawTransaction(signedTx).send().transactionHash
            
            TransactionResult.Success(txHash, "Storage fee paid successfully")
        } catch (e: Exception) {
            TransactionResult.Error("Failed to pay storage fee: ${e.message}")
        }
    }
    
    /**
     * Sign a message for authentication purposes.
     */
    fun signMessage(message: String): String? {
        return try {
            walletService.signMessage(message)
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Wait for transaction confirmation.
     */
    suspend fun waitForConfirmation(
        txHash: String, 
        maxWaitTime: Long = 60000
    ): Boolean = withContext(Dispatchers.IO) {
        val startTime = System.currentTimeMillis()
        
        while (System.currentTimeMillis() - startTime < maxWaitTime) {
            try {
                val receipt = web3j.ethGetTransactionReceipt(txHash).send()
                if (receipt.transactionReceipt.isPresent) {
                    return@withContext receipt.transactionReceipt.get().isStatusOK
                }
                kotlinx.coroutines.delay(2000) // Wait 2 seconds before checking again
            } catch (e: Exception) {
                // Continue waiting
            }
        }
        false
    }
    
    /**
     * Clear wallet data from memory.
     */
    fun clearWallet() {
        walletService.clearWallet()
        sharedPrefs.clearWalletAddress()
    }
    
    /**
     * Check if wallet is ready for transactions.
     */
    fun isWalletReady(): Boolean {
        return walletService.isWalletInitialized()
    }
}

/**
 * Result of a transaction operation.
 */
sealed class TransactionResult {
    data class Success(val txHash: String, val message: String) : TransactionResult()
    data class Error(val message: String) : TransactionResult()
}
