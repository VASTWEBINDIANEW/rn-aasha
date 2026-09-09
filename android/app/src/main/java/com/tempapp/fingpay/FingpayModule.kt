package com.universalrecharge

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import com.facebook.react.bridge.*

class FingpayModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pendingPromise: Promise? = null

    companion object {
        const val REQUEST_CODE = 1234
        const val SDK_ACTIVITY_CLASS = "com.tapits.fingpayupicashwithdrawal.LoginScreenUpi"
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "FingpaySDK"

    @ReactMethod
    fun startCashWithdrawal(params: ReadableMap, promise: Promise) {
        val activity = currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current Activity not found")
            return
        }

        if (pendingPromise != null) {
            promise.reject("BUSY", "Another transaction is already in progress")
            return
        }

        pendingPromise = promise

        activity.runOnUiThread {
            try {
                val intent = Intent().apply {
                    setClassName(activity.packageName, SDK_ACTIVITY_CLASS)

                    // Credentials & Transaction
                    putExtra("MERCHANT_ID", params.getOptionalString("merchantId"))
                    putExtra("MERCHANT_PASSWORD", params.getOptionalString("merchantPassword"))
                    putExtra("PASSWORD", params.getOptionalString("merchantPassword"))
                    putExtra("2", params.getOptionalString("superMerchantId"))
                    putExtra("AMOUNT", params.getOptionalString("amount"))

                    // Location
                    putExtra("LATITUDE", params.getOptionalDouble("latitude"))
                    putExtra("LONGITUDE", params.getOptionalDouble("longitude"))

                    // Partner Txn ID
                    putExtra("PARTNER_REQUEST_ID", params.getOptionalString("txnId"))

                    // UI Configuration Flags
                    putExtra("READ_ONLY_BUTTON", params.getOptionalBoolean("readOnly"))
                    putExtra("EDITABLE_BUTTON", params.getOptionalBoolean("editable"))
                    putExtra("EMPTY_BUTTON", params.getOptionalBoolean("emptyButton"))

                    // Color Theming
                    putExtra("PRIMARY_COLOR", params.getOptionalString("primaryColor", "#3A7DFF"))
                    putExtra("SECONDARY_COLOR", params.getOptionalString("secondaryColor", "#9D5B87"))
                    putExtra("PRIMARY_BUTTON_COLOR", params.getOptionalString("primaryButtonColor", "#F1C40F"))
                    putExtra("SECONDARY_BUTTON_COLOR", params.getOptionalString("secondaryButtonColor", "#E74C3C"))
                    putExtra("LABEL_COLOR", params.getOptionalString("labelColor", "#2ECC71"))
                }

                activity.startActivityForResult(intent, REQUEST_CODE)

            } catch (e: ActivityNotFoundException) {
                pendingPromise?.reject("SDK_NOT_FOUND", "Fingpay SDK Activity not found in manifest")
                pendingPromise = null
            } catch (e: Exception) {
                pendingPromise?.reject("INTENT_ERROR", e.localizedMessage ?: "Failed to start intent")
                pendingPromise = null
            }
        }
    }

    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode != REQUEST_CODE) return

        val promise = pendingPromise ?: return
        pendingPromise = null // Clear reference immediately

        if (resultCode == Activity.RESULT_OK) {
            val responseMap = Arguments.createMap()
            data?.extras?.let { extras ->
                for (key in extras.keySet()) {
                    responseMap.putString(key, extras.get(key)?.toString() ?: "")
                }
            }
            promise.resolve(responseMap)
        } else {
            promise.reject("USER_CANCELLED", "User cancelled or pressed back")
        }
    }

    override fun onNewIntent(intent: Intent?) {}

    override fun invalidate() {
        super.invalidate()
        reactContext.removeActivityEventListener(this)
    }

    // --- Helper Extensions for Safe ReadableMap Access ---

    private fun ReadableMap.getOptionalString(key: String, defaultValue: String = ""): String {
        return if (hasKey(key) && !isNull(key)) getString(key) ?: defaultValue else defaultValue
    }

    private fun ReadableMap.getOptionalDouble(key: String, defaultValue: Double = 0.0): Double {
        return if (hasKey(key) && !isNull(key)) getDouble(key) else defaultValue
    }

    private fun ReadableMap.getOptionalBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return if (hasKey(key) && !isNull(key)) getBoolean(key) else defaultValue
    }
}