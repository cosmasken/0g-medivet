package com.medivet.healthconnect.util

import android.content.Context
import android.content.SharedPreferences

class SharedPreferencesHelper private constructor(context: Context) {
    private val prefs: SharedPreferences = 
        context.applicationContext.getSharedPreferences("medivet_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USERNAME = "username"
        private const val KEY_WALLET_ADDRESS = "wallet_address"

        @Volatile
        private var INSTANCE: SharedPreferencesHelper? = null

        fun getInstance(context: Context): SharedPreferencesHelper {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: SharedPreferencesHelper(context).also { INSTANCE = it }
            }
        }
    }

    fun setIsLoggedIn(isLoggedIn: Boolean) {
        prefs.edit().putBoolean(KEY_IS_LOGGED_IN, isLoggedIn).apply()
    }

    fun isLoggedIn(): Boolean {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false)
    }

    fun setUserInfo(userId: String, username: String, walletAddress: String) {
        prefs.edit()
            .putString(KEY_USER_ID, userId)
            .putString(KEY_USERNAME, username)
            .putString(KEY_WALLET_ADDRESS, walletAddress)
            .apply()
    }

    fun getUserInfo(): Triple<String?, String?, String?> {
        val userId = prefs.getString(KEY_USER_ID, null)
        val username = prefs.getString(KEY_USERNAME, null)
        val walletAddress = prefs.getString(KEY_WALLET_ADDRESS, null)
        return Triple(userId, username, walletAddress)
    }

    fun clearUserInfo() {
        prefs.edit()
            .remove(KEY_USER_ID)
            .remove(KEY_USERNAME)
            .remove(KEY_WALLET_ADDRESS)
            .remove(KEY_IS_LOGGED_IN)
            .apply()
    }

    fun saveWalletAddress(walletAddress: String) {
        prefs.edit().putString(KEY_WALLET_ADDRESS, walletAddress).apply()
    }

    fun getWalletAddress(): String? {
        return prefs.getString(KEY_WALLET_ADDRESS, null)
    }

    fun clearWalletAddress() {
        prefs.edit().remove(KEY_WALLET_ADDRESS).apply()
    }
}