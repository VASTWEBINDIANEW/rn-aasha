// package com.ssvcms

// import android.app.Application
// import com.facebook.react.PackageList
// import com.facebook.react.ReactApplication
// import com.facebook.react.ReactHost
// import com.facebook.react.ReactNativeHost
// import com.facebook.react.ReactPackage
// import com.facebook.react.defaults.DefaultReactNativeHost
// import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
// import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
// import com.facebook.soloader.SoLoader
// import com.facebook.react.soloader.OpenSourceMergedSoMapping

// import com.ssvcms.AepsPackage
// import com.ssvcms.upi.UpiPackage
// import com.ssvcms.location.LocationPackage
// import com.ssvcms.security.SecurityPackage
// import com.ssvcms.ContactPicker.ContactPickerPackage

// class MainApplication : Application(), ReactApplication {

//   override val reactNativeHost: ReactNativeHost =
//       object : DefaultReactNativeHost(this) {

//         override fun getPackages(): List<ReactPackage> {
//           val packages = PackageList(this).packages

//           // 👇 Add manually linked packages
//           packages.add(UpiPackage())
//           packages.add(AepsPackage())
//           packages.add(SecurityPackage())
//           packages.add(ContactPickerPackage())
//           packages.add(LocationPackage())

//           return packages
//         }

//         override fun getJSMainModuleName(): String = "index"

//         override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

//         override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
//         override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
//       }

//   override val reactHost: ReactHost
//     get() = getDefaultReactHost(applicationContext, reactNativeHost)

//   override fun onCreate() {
//     super.onCreate()
//     SoLoader.init(this, OpenSourceMergedSoMapping)

//     if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
//       load()
//     }
//   }
// }

package com.ssvcms

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.soloader.SoLoader
import com.facebook.react.soloader.OpenSourceMergedSoMapping

import com.ssvcms.AepsPackage
import com.ssvcms.upi.UpiPackage
import com.ssvcms.location.LocationPackage
import com.ssvcms.security.SecurityPackage
import com.ssvcms.ContactPicker.ContactPickerPackage

// ✅ सही import
import com.otahotupdate.OtaHotUpdate

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {

        // ✅ bundleJS() — सही method
        override fun getJSBundleFile(): String {
          return OtaHotUpdate.bundleJS(applicationContext)
        }

        override fun getPackages(): List<ReactPackage> {
          val packages = PackageList(this).packages
          packages.add(UpiPackage())
          packages.add(AepsPackage())
          packages.add(SecurityPackage())
          packages.add(ContactPickerPackage())
          packages.add(LocationPackage())

          // ✅ OtaHotUpdate package की तरह add करें
        //  packages.add(OtaHotUpdate())

          return packages
        }

        override fun getJSMainModuleName(): String = "index"
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)

    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}