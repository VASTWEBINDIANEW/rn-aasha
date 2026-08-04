package com.pemudra

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*

class FingpayModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "FingpaySDK"

    companion object {
        const val REQUEST_CODE = 1234
        var pendingPromise: Promise? = null
    }

    @ReactMethod
    fun startCashWithdrawal(params: ReadableMap, promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("ERROR", "Activity not found")
            return
        }

        pendingPromise = promise

        val intent = Intent()
        intent.setClassName(
            activity,
            "com.tapits.fingpayupicashwithdrawal.LoginScreenUpi"
        )

        intent.putExtra("MERCHANT_ID",       params.getString("merchantId") ?: "")
        intent.putExtra("MERCHANT_PASSWORD", params.getString("merchantPassword") ?: "")
        intent.putExtra("PASSWORD",          params.getString("merchantPassword") ?: "")
        intent.putExtra("2",  params.getString("superMerchantId") ?: "")
        intent.putExtra("AMOUNT",            params.getString("amount") ?: "")
        intent.putExtra("LATITUDE",          params.getDouble("latitude"))
        intent.putExtra("LONGITUDE",         params.getDouble("longitude"))
        intent.putExtra("PARTNER_REQUEST_ID",params.getString("txnId") ?: "")
        intent.putExtra("READ_ONLY_BUTTON",  params.getBoolean("readOnly"))
        intent.putExtra("EDITABLE_BUTTON",   params.getBoolean("editable"))
        intent.putExtra("EMPTY_BUTTON",      params.getBoolean("emptyButton"))
        intent.putExtra("PRIMARY_COLOR",          params.getString("primaryColor") ?: "#3A7DFF")
        intent.putExtra("SECONDARY_COLOR",        params.getString("secondaryColor") ?: "#9D5B87")
        intent.putExtra("PRIMARY_BUTTON_COLOR",   params.getString("primaryButtonColor") ?: "#F1C40F")
        intent.putExtra("SECONDARY_BUTTON_COLOR", params.getString("secondaryButtonColor") ?: "#E74C3C")
        intent.putExtra("LABEL_COLOR",            params.getString("labelColor") ?: "#2ECC71")

        android.util.Log.d("FINGPAY_DEBUG", "=========== REQUEST DATA ===========")
        intent.extras?.keySet()?.forEach { key ->
            android.util.Log.d("FINGPAY_DEBUG", "$key = ${intent.extras?.get(key)}")
        }
        android.util.Log.d("FINGPAY_DEBUG", "====================================")

        activity.startActivityForResult(intent, REQUEST_CODE)
    }
}