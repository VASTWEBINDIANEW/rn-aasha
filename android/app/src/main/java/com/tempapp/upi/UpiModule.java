package com.digitalindiapay.upi;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class UpiModule extends ReactContextBaseJavaModule {

    private static final int UPI_REQUEST = 2024;
    private Promise upiPromise;

    public UpiModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(activityEventListener);
    }

    @NonNull
    @Override
    public String getName() {
        return "UpiNative";
    }

    @ReactMethod
    public synchronized void pay(String upiUrl, Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not attached");
            return;
        }

        // ❗ Prevent double launch
        if (upiPromise != null) {
            promise.reject("IN_PROGRESS", "UPI transaction already in progress");
            return;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(upiUrl));

            // ✅ Check UPI app exists
            if (intent.resolveActivity(activity.getPackageManager()) == null) {
                promise.reject("NO_UPI_APP", "No UPI app installed");
                return;
            }

            upiPromise = promise;

            Intent chooser = Intent.createChooser(intent, "Pay with UPI");
            activity.startActivityForResult(chooser, UPI_REQUEST);

        } catch (Exception e) {
            Log.e("UPI_NATIVE", "UPI launch failed", e);
            upiPromise = null;
            promise.reject("UPI_ERROR", e.getMessage());
        }
    }

    private final ActivityEventListener activityEventListener =
        new BaseActivityEventListener() {

            @Override
            public void onActivityResult(
                    Activity activity,
                    int requestCode,
                    int resultCode,
                    Intent data
            ) {
                if (requestCode != UPI_REQUEST || upiPromise == null) {
                    return;
                }

                // ⚠️ Reality: most UPI apps don't return proper data
                String response = null;

                if (data != null) {
                    response = data.getStringExtra("response");
                    Log.d("UPI_NATIVE", "UPI RESPONSE: " + response);
                }

                // ✅ Always resolve, backend verification required
                if (response == null || response.isEmpty()) {
                    upiPromise.resolve("SUBMITTED");
                } else {
                    upiPromise.resolve(response);
                }

                upiPromise = null;
            }
        };
}
