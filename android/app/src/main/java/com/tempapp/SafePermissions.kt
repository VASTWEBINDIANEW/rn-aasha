package com.digitalindiapay   // ✅ was com.worldpayone

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class SafePermissions {

    interface PermissionCallback {
        fun onGranted()
        fun onDenied()
    }

    companion object {
        private const val CONTACTS_REQUEST = 1001
        private const val LOCATION_REQUEST = 1002

        fun requestContacts(activity: Activity, callback: PermissionCallback) {
            if (ContextCompat.checkSelfPermission(activity, Manifest.permission.READ_CONTACTS)
                == PackageManager.PERMISSION_GRANTED) {
                callback.onGranted()
            } else {
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(Manifest.permission.READ_CONTACTS),
                    CONTACTS_REQUEST
                )
            }
        }

        fun requestLocation(activity: Activity, callback: PermissionCallback) {
            val permissions = arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
            ActivityCompat.requestPermissions(activity, permissions, LOCATION_REQUEST)
        }
    }
}