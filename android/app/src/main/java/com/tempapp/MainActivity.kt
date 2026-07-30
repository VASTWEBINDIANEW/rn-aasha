// package com.digitalindiapay

// import android.Manifest
// import android.app.Activity
// import android.content.pm.PackageManager
// import android.os.Bundle
// import android.widget.Toast
// import androidx.core.app.ActivityCompat
// import androidx.core.content.ContextCompat
// import com.facebook.react.ReactActivity
// import com.facebook.react.ReactActivityDelegate
// import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
// import com.facebook.react.defaults.DefaultReactActivityDelegate

// class MainActivity : ReactActivity() {

//     override fun getMainComponentName(): String = "digitalindiapay"

//     override fun createReactActivityDelegate(): ReactActivityDelegate =
//         DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

//     override fun onCreate(savedInstanceState: Bundle?) {
//         super.onCreate(savedInstanceState)
//     }

//     // ✅ FIXED: Correct override + return Unit
//     override fun onRequestPermissionsResult(
//         requestCode: Int,
//         permissions: Array<out String>,
//         grantResults: IntArray
//     ) {
//         super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
//         when (requestCode) {
//             1001 -> { // Contacts
//                 val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
//                 if (granted) {
//                     Toast.makeText(this, "Contacts ✅", Toast.LENGTH_SHORT).show()
//                 } else {
//                     Toast.makeText(this, "Contacts ❌", Toast.LENGTH_LONG).show()
//                 }
//             }
//             1002 -> { // Location
//                 val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
//                 if (allGranted) {
//                     Toast.makeText(this, "Location ✅", Toast.LENGTH_SHORT).show()
//                 } else {
//                     Toast.makeText(this, "Location ❌", Toast.LENGTH_LONG).show()
//                 }
//             }
//         }
//     }

//     companion object {
//         @JvmStatic
//         fun hasContactsPermission(activity: Activity): Boolean {
//             return ContextCompat.checkSelfPermission(
//                 activity, 
//                 Manifest.permission.READ_CONTACTS
//             ) == PackageManager.PERMISSION_GRANTED
//         }

//         @JvmStatic
//         fun requestContacts(activity: Activity) {
//             if (!hasContactsPermission(activity)) {
//                 ActivityCompat.requestPermissions(
//                     activity,
//                     arrayOf(Manifest.permission.READ_CONTACTS),
//                     1001
//                 )
//             }
//         }

//         @JvmStatic
//         fun hasLocationPermission(activity: Activity): Boolean {
//             return ContextCompat.checkSelfPermission(
//                 activity, 
//                 Manifest.permission.ACCESS_FINE_LOCATION
//             ) == PackageManager.PERMISSION_GRANTED
//         }

//         @JvmStatic
//         fun requestLocation(activity: Activity) {
//             val permissions = arrayOf(
//                 Manifest.permission.ACCESS_FINE_LOCATION,
//                 Manifest.permission.ACCESS_COARSE_LOCATION
//             )
//             ActivityCompat.requestPermissions(activity, permissions, 1002)
//         }
//     }
// }
package com.digitalindiapay

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.enableEdgeToEdge // 1. Add this import
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "digitalindiapay"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        // 2. Super se pehle enableEdgeToEdge call karein
        enableEdgeToEdge() 
        super.onCreate(savedInstanceState)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        when (requestCode) {
            1001 -> {
                val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
                if (granted) {
                    Toast.makeText(this, "Contacts ✅", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "Contacts ❌", Toast.LENGTH_LONG).show()
                }
            }
            1002 -> {
                val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
                if (allGranted) {
                    Toast.makeText(this, "Location ✅", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "Location ❌", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    companion object {
        @JvmStatic
        fun hasContactsPermission(activity: Activity): Boolean {
            return ContextCompat.checkSelfPermission(
                activity, 
                Manifest.permission.READ_CONTACTS
            ) == PackageManager.PERMISSION_GRANTED
        }

        @JvmStatic
        fun requestContacts(activity: Activity) {
            if (!hasContactsPermission(activity)) {
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(Manifest.permission.READ_CONTACTS),
                    1001
                )
            }
        }

        @JvmStatic
        fun hasLocationPermission(activity: Activity): Boolean {
            return ContextCompat.checkSelfPermission(
                activity, 
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        }

        @JvmStatic
        fun requestLocation(activity: Activity) {
            val permissions = arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
            ActivityCompat.requestPermissions(activity, permissions, 1002)
        }
    }
}