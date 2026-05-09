// dummy.cpp
// This file is intentionally minimal.
// It exists to satisfy the externalNativeBuild requirement
// for 16KB page size support in Android.

#include <jni.h>
#include <android/log.h>

#define TAG "TempApp"

extern "C" {
// Optional: native init function (can be called from Java/Kotlin if needed)
JNIEXPORT void JNICALL
Java_com_tempapp_MainActivity_nativeInit(JNIEnv *env, jobject thiz) {
__android_log_print(ANDROID_LOG_DEBUG, TAG, "Native init called");
}
}