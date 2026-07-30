package com.digitalindiapay.ContactPicker;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class ContactPickerModule extends ReactContextBaseJavaModule {

    private static final int PICK_CONTACT = 101;
    private Promise promise;

    public ContactPickerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(activityEventListener);
    }

    @NonNull
    @Override
    public String getName() {
        return "ContactPicker";
    }

    @ReactMethod
    public void pickContact(Promise promise) {

        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available");
            return;
        }

        if (this.promise != null) {
            promise.reject("IN_PROGRESS", "Contact picker already open");
            return;
        }

        this.promise = promise;

        try {
            Intent intent = new Intent(
                    Intent.ACTION_PICK,
                    ContactsContract.CommonDataKinds.Phone.CONTENT_URI
            );

            currentActivity.startActivityForResult(intent, PICK_CONTACT);

        } catch (Exception e) {
            this.promise = null;
            promise.reject("ERROR", e.getMessage());
        }
    }

    private final ActivityEventListener activityEventListener =
            new BaseActivityEventListener() {

        @Override
        public void onActivityResult(
                Activity activity,
                int requestCode,
                int resultCode,
                @Nullable Intent data
        ) {

            if (requestCode != PICK_CONTACT) return;
            if (promise == null) return;

            if (resultCode != Activity.RESULT_OK || data == null) {
                promise.reject("CANCELLED", "User cancelled");
                promise = null;
                return;
            }

            Cursor cursor = null;

            try {
                Uri contactUri = data.getData();

                if (contactUri == null) {
                    promise.reject("NO_URI", "Contact URI is null");
                    promise = null;
                    return;
                }

                cursor = activity.getContentResolver().query(
                        contactUri,
                        null,
                        null,
                        null,
                        null
                );

                if (cursor == null || !cursor.moveToFirst()) {
                    promise.reject("NO_DATA", "No contact data found");
                    promise = null;
                    return;
                }

                int nameIndex = cursor.getColumnIndex(
                        ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME
                );

                int phoneIndex = cursor.getColumnIndex(
                        ContactsContract.CommonDataKinds.Phone.NUMBER
                );

                String name = "";
                String phone = "";

                if (nameIndex >= 0) {
                    name = cursor.getString(nameIndex);
                }

                if (phoneIndex >= 0) {
                    phone = cursor.getString(phoneIndex);
                }

                if (name == null) name = "";
                if (phone == null) phone = "";

                // Optional: clean phone formatting
                phone = phone.replaceAll("[^0-9+]", "");

                WritableMap map = Arguments.createMap();
                map.putString("name", name);
                map.putString("phone", phone);

                promise.resolve(map);

            } catch (Exception e) {
                promise.reject("ERROR", e.getMessage());
            } finally {
                if (cursor != null) {
                    cursor.close();
                }
                promise = null;
            }
        }
    };
}