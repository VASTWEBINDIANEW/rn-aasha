package com.digitalindiapay;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.appcompat.app.AlertDialog;

import com.facebook.react.bridge.*;

import it.services.pspwdmt.ui.DmtHostActivity;

public class AepsModule extends ReactContextBaseJavaModule {

    private static final int REQUEST_CODE = 1111;
    private Promise appPromise;

    public AepsModule(ReactApplicationContext reactContext) {
        super(reactContext);

        reactContext.addActivityEventListener(new BaseActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

                if (requestCode == REQUEST_CODE && appPromise != null) {

                    if (resultCode == Activity.RESULT_OK) {

                        String response = data != null
                                ? data.getStringExtra("response")
                                : "NO_DATA";

                        appPromise.resolve(response);

                    } else if (resultCode == Activity.RESULT_CANCELED) {

                        appPromise.resolve("CANCELLED");

                        new AlertDialog.Builder(activity)
                                .setMessage("Transaction Aborted")
                                .setPositiveButton("OK", null)
                                .show();
                    }

                    appPromise = null;
                }
            }
        });
    }

    @Override
    public String getName() {
        return "AepsModule";
    }

    @ReactMethod
    public void initCredo(String merchantCode, String pApi, String partnerId, Promise promise) {

        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist");
            return;
        }

        appPromise = promise;

        try {
            Intent intent = new Intent(currentActivity, DmtHostActivity.class);
            intent.putExtra("partnerId", partnerId);
            intent.putExtra("partnerApiKey", pApi);
            intent.putExtra("merchantCode", merchantCode);

            currentActivity.startActivityForResult(intent, REQUEST_CODE);

        } catch (Exception e) {
            promise.reject("SDK_ERROR", e.getMessage());
        }
    }
}