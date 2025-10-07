package com.medivet.healthconnect.util

import org.web3j.crypto.Credentials
import org.web3j.utils.Numeric
import java.security.MessageDigest

object CryptoUtils {

    /**
     * Generates a deterministic EVM-compatible wallet address from a username and password.
     *
     * This function uses SHA-256 to hash a combination of the username and password,
     * ensuring that the same credentials always produce the same private key and address.
     *
     * @param username The user's username.
     * @param password The user's password.
     * @return A string representing the wallet address.
     */
    fun generateAddressFromCredentials(username: String, password: String): String {
        val input = "$username:$password"
        val digest = MessageDigest.getInstance("SHA-256")
        val privateKeyBytes = digest.digest(input.toByteArray())
        val privateKey = Numeric.toHexString(privateKeyBytes)
        val credentials = Credentials.create(privateKey)
        return credentials.address
    }
}
