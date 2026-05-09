# ============================================
# CRITICAL FIX: Firebase & JSON (Prevents the crash)
# ============================================
-keep class org.json.** { *; }
-dontwarn org.json.**

-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# ============================================
# Google GMS Credentials (deprecated API)
# ============================================
-dontwarn com.google.android.gms.auth.api.credentials.**
-keep class com.google.android.gms.auth.api.credentials.** { *; }

# ============================================
# PayU Optional Modules & Core
# ============================================
-dontwarn com.payu.olamoney.**
-dontwarn com.payu.otpassist.**
-dontwarn com.payu.phonepe.**
-dontwarn com.payu.checkoutpro.**
-keep class com.payu.** { *; }
-keep class in.payu.** { *; }
-dontwarn in.payu.**

# ============================================
# Retrofit Scalars Converter
# ============================================
-dontwarn retrofit2.converter.scalars.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions

# ============================================
# PDFBox
# ============================================
-dontwarn com.tom_roush.pdfbox.**
-keep class com.tom_roush.pdfbox.** { *; }

# ============================================
# CredoPay / SPS SDK
# ============================================
-dontwarn com.lib.sps.**
-keep class com.lib.sps.** { *; }
-keep class in.credopay.** { *; }
-dontwarn in.credopay.**

# ============================================
# React Native
# ============================================
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.**
-keep class com.oblador.vectoricons.** { *; }

# ============================================
# General Safety Rules
# ============================================
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**