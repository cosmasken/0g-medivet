package com.medivet.healthconnect.data.wallet

import org.web3j.abi.FunctionEncoder
import org.web3j.abi.datatypes.Function
import org.web3j.abi.datatypes.Type
import org.web3j.abi.datatypes.Utf8String
import org.web3j.abi.datatypes.Address
import org.web3j.abi.datatypes.generated.Uint256
import java.math.BigInteger

/**
 * Builder for 0G Network specific transactions.
 * Handles contract interactions for medical data operations.
 */
class ZeroGTransactionBuilder {
    
    companion object {
        // 0G Network contract addresses (testnet)
        const val MEDICAL_RECORD_ACCESS_CONTRACT = "0x6a301456A5274dF720913Ec5C9A48992DFF2a830"
        
        // Standard gas limits for different operations
        const val STORAGE_UPLOAD_GAS = 500000L
        const val CONTRACT_CALL_GAS = 200000L
        const val SIMPLE_TRANSFER_GAS = 21000L
    }
    
    /**
     * Build transaction data for granting provider access to medical records.
     */
    fun buildGrantAccessTransaction(
        providerAddress: String,
        recordHash: String,
        expirationTimestamp: Long
    ): TransactionData {
        val function = Function(
            "grantAccess",
            listOf(
                Address(providerAddress),
                Utf8String(recordHash),
                Uint256(BigInteger.valueOf(expirationTimestamp))
            ),
            emptyList()
        )
        
        val encodedFunction = FunctionEncoder.encode(function)
        
        return TransactionData(
            to = MEDICAL_RECORD_ACCESS_CONTRACT,
            data = encodedFunction,
            gasLimit = BigInteger.valueOf(CONTRACT_CALL_GAS),
            value = BigInteger.ZERO
        )
    }
    
    /**
     * Build transaction data for revoking provider access.
     */
    fun buildRevokeAccessTransaction(
        providerAddress: String,
        recordHash: String
    ): TransactionData {
        val function = Function(
            "revokeAccess",
            listOf(
                Address(providerAddress),
                Utf8String(recordHash)
            ),
            emptyList()
        )
        
        val encodedFunction = FunctionEncoder.encode(function)
        
        return TransactionData(
            to = MEDICAL_RECORD_ACCESS_CONTRACT,
            data = encodedFunction,
            gasLimit = BigInteger.valueOf(CONTRACT_CALL_GAS),
            value = BigInteger.ZERO
        )
    }
    
    /**
     * Build transaction data for registering a new medical record.
     */
    fun buildRegisterRecordTransaction(
        recordHash: String,
        encryptedMetadata: String
    ): TransactionData {
        val function = Function(
            "registerRecord",
            listOf(
                Utf8String(recordHash),
                Utf8String(encryptedMetadata)
            ),
            emptyList()
        )
        
        val encodedFunction = FunctionEncoder.encode(function)
        
        return TransactionData(
            to = MEDICAL_RECORD_ACCESS_CONTRACT,
            data = encodedFunction,
            gasLimit = BigInteger.valueOf(CONTRACT_CALL_GAS),
            value = BigInteger.ZERO
        )
    }
    
    /**
     * Build transaction data for 0G Storage fee payment.
     */
    fun buildStorageFeeTransaction(
        storageNodeAddress: String,
        feeAmount: BigInteger
    ): TransactionData {
        return TransactionData(
            to = storageNodeAddress,
            data = "0x",
            gasLimit = BigInteger.valueOf(SIMPLE_TRANSFER_GAS),
            value = feeAmount
        )
    }
}

/**
 * Data class representing transaction parameters.
 */
data class TransactionData(
    val to: String,
    val data: String,
    val gasLimit: BigInteger,
    val value: BigInteger,
    val gasPrice: BigInteger? = null
)
