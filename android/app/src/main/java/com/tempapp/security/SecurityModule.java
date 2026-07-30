package com.digitalindiapay.security;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import android.os.Build;

public class SecurityModule extends ReactContextBaseJavaModule {
    private static final int LOCK_REQUEST_CODE = 221;
    private Promise mCurrentPromise;
    private boolean isAuthInProgress = false;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            super.onActivityResult(activity, requestCode, resultCode, data);
            
            if (requestCode == LOCK_REQUEST_CODE && isAuthInProgress) {
                handleAuthResult(resultCode == Activity.RESULT_OK);
            }
        }
    };

    public SecurityModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(mActivityEventListener);
    }

    @Override
    public void invalidate() {
        super.invalidate();
        // RN 0.77 fix: Cleanup on module destroy
        if (mCurrentPromise != null) {
            mCurrentPromise.reject("MODULE_INVALIDATED", "Module was destroyed");
            mCurrentPromise = null;
        }
        isAuthInProgress = false;
    }

    @NonNull
    @Override
    public String getName() {
        return "SecurityModule";
    }

    @ReactMethod
    public void showScreenLock(Promise promise) {
        // RN 0.77: Double-check activity
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null || currentActivity.isFinishing() || currentActivity.isDestroyed()) {
            safeReject(promise, "ACTIVITY_GONE", "Activity not available");
            return;
        }

        // Prevent multiple calls
        if (isAuthInProgress) {
            safeReject(promise, "PENDING_AUTH", "Authentication already in progress");
            return;
        }

        mCurrentPromise = promise;
        isAuthInProgress = true;

        try {
            KeyguardManager km = (KeyguardManager) 
                getReactApplicationContext().getSystemService(Context.KEYGUARD_SERVICE);

            if (km == null) {
                handleAuthResult(false);
                return;
            }

            boolean isSecure = isDeviceSecure(km);
            if (!isSecure) {
                handleAuthResult(false);
                return;
            }

            Intent intent = createLockIntent(km);
            if (intent != null) {
                currentActivity.startActivityForResult(intent, LOCK_REQUEST_CODE);
            } else {
                handleAuthResult(true); // Fallback
            }
        } catch (Exception e) {
            handleAuthResult(false);
        }
    }

    @ReactMethod
    public void checkDeviceSecurity(Promise promise) {
        try {
            KeyguardManager km = (KeyguardManager) 
                getReactApplicationContext().getSystemService(Context.KEYGUARD_SERVICE);

            if (km == null) {
                promise.reject("ERROR", "KeyguardManager unavailable");
                return;
            }

            boolean isSecure = isDeviceSecure(km);
            promise.resolve(isSecure ? "SECURE" : "NOT_SECURE");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // ✅ Helper Methods
    private boolean isDeviceSecure(KeyguardManager km) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return km.isDeviceSecure();
        } else {
            return km.isKeyguardSecure();
        }
    }

    private Intent createLockIntent(KeyguardManager km) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            return km.createConfirmDeviceCredentialIntent("Security Check", "Verify your identity");
        } else {
            return km.createConfirmDeviceCredentialIntent("Security Check", "Please unlock");
        }
    }

    private void handleAuthResult(boolean success) {
        if (mCurrentPromise != null) {
            mCurrentPromise.resolve(success);
            mCurrentPromise = null;
        }
        isAuthInProgress = false;
    }

    private void safeReject(Promise promise, String code, String message) {
        try {
            promise.reject(code, message);
        } catch (Exception ignored) {
            // Ignore reject errors
        } finally {
            if (mCurrentPromise != null) {
                mCurrentPromise = null;
            }
            isAuthInProgress = false;
        }
    }
}