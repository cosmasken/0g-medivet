package com.medivet.healthconnect.data.wallet

import org.web3j.crypto.Credentials
import org.web3j.crypto.RawTransaction
import org.web3j.crypto.TransactionEncoder
import org.web3j.protocol.Web3j
import org.web3j.protocol.core.DefaultBlockParameterName
import org.web3j.protocol.http.HttpService
import org.web3j.utils.Convert
import org.web3j.utils.Numeric
import java.math.BigInteger
import java.security.MessageDigest

/**
 * Service for managing wallet operations and transaction signing on mobile.
 * Provides secure transaction signing for 0G Network operations.
 */
class WalletService {
    
    private val web3j: Web3j by lazy {
        Web3j.build(HttpService("https://evmrpc-testnet.0g.ai"))
    }
    
    private var credentials: Credentials? = null
    
    /**
     * Initialize wallet from username/password credentials.
     * Generates deterministic private key for consistent wallet address.
     */
    fun initializeWallet(username: String, password: String) {
        val privateKey = generatePrivateKeyFromCredentials(username, password)
        credentials = Credentials.create(privateKey)
    }
    
    /**
     * Get the current wallet address.
     */
    fun getWalletAddress(): String? {
        return credentials?.address
    }
    
    /**
     * Sign a transaction for 0G Network operations.
     * 
     * @param to Recipient address
     * @param value Amount in wei (use BigInteger.ZERO for contract calls)
     * @param data Transaction data (for contract calls)
     * @param gasLimit Gas limit for the transaction
     * @param gasPrice Gas price in wei
     * @return Signed transaction hex string
     */
    suspend fun signTransaction(
        to: String,
        value: BigInteger = BigInteger.ZERO,
        data: String = "0x",
        gasLimit: BigInteger = BigInteger.valueOf(21000),
        gasPrice: BigInteger? = null
    ): String {
        val creds = credentials ?: throw IllegalStateException("Wallet not initialized")
        
        // Get nonce
        val nonce = web3j.ethGetTransactionCount(
            creds.address, 
            DefaultBlockParameterName.PENDING
        ).send().transactionCount
        
        // Get gas price if not provided
        val finalGasPrice = gasPrice ?: web3j.ethGasPrice().send().gasPrice
        
        // Create raw transaction
        val rawTransaction = RawTransaction.createTransaction(
            nonce,
            finalGasPrice,
            gasLimit,
            to,
            value,
            data
        )
        
        // Sign transaction
        val signedMessage = TransactionEncoder.signMessage(rawTransaction, creds)
        return Numeric.toHexString(signedMessage)
    }
    
    /**
     * Sign a message for authentication or verification purposes.
     */
    fun signMessage(message: String): String {
        val creds = credentials ?: throw IllegalStateException("Wallet not initialized")
        
        // Create Ethereum signed message
        val messageBytes = message.toByteArray()
        val prefix = "\u0019Ethereum Signed Message:\n${messageBytes.size}".toByteArray()
        val fullMessage = prefix + messageBytes
        
        // Hash the message
        val digest = MessageDigest.getInstance("Keccak-256")
        val hash = digest.digest(fullMessage)
        
        // Sign the hash
        val signature = org.web3j.crypto.Sign.signMessage(hash, creds.ecKeyPair)
        
        // Format signature
        val r = Numeric.toHexString(signature.r)
        val s = Numeric.toHexString(signature.s)
        val v = signature.v[0].toInt()
        
        return r + s.substring(2) + String.format("%02x", v)
    }
    
    /**
     * Get current balance in ETH.
     */
    suspend fun getBalance(): BigInteger {
        val address = credentials?.address ?: throw IllegalStateException("Wallet not initialized")
        return web3j.ethGetBalance(address, DefaultBlockParameterName.LATEST).send().balance
    }
    
    /**
     * Convert wei to ETH for display purposes.
     */
    fun weiToEth(wei: BigInteger): String {
        return Convert.fromWei(wei.toString(), Convert.Unit.ETHER).toString()
    }
    
    /**
     * Generate deterministic private key from username/password.
     * Same implementation as CryptoUtils for consistency.
     */
    private fun generatePrivateKeyFromCredentials(username: String, password: String): String {
        val input = "$username:$password"
        val digest = MessageDigest.getInstance("SHA-256")
        val privateKeyBytes = digest.digest(input.toByteArray())
        return Numeric.toHexString(privateKeyBytes)
    }
    
    /**
     * Clear wallet credentials from memory.
     */
    fun clearWallet() {
        credentials = null
    }
    
    /**
     * Check if wallet is initialized.
     */
    fun isWalletInitialized(): Boolean {
        return credentials != null
    }
}
