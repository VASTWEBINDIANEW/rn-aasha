package com.digitalindiapay.location;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.LocationManager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.*;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;

import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.location.*;
import com.google.android.gms.tasks.Task;  // ✅ THIS WAS MISSING

import java.io.IOException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.*;

public class LocationModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private final FusedLocationProviderClient fusedClient;

    private Promise gpsPromise;

    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.fusedClient = LocationServices.getFusedLocationProviderClient(reactContext);

        reactContext.addActivityEventListener(mActivityEventListener);
    }

    @NonNull
    @Override
    public String getName() {
        return "LocationModule";
    }

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

            if (requestCode == 1000) {
                if (gpsPromise == null) return;

                if (resultCode == Activity.RESULT_OK) {
                    gpsPromise.resolve("ENABLED");
                } else {
                    gpsPromise.reject("DENIED", "User cancelled GPS enable");
                }
                gpsPromise = null;
            }
        }
    };

    @ReactMethod
    public void requestGPSEnabling(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity null");
            return;
        }

        gpsPromise = promise;

        LocationRequest locationRequest = new LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY, 10000
        ).build();

        LocationSettingsRequest.Builder builder =
                new LocationSettingsRequest.Builder().addLocationRequest(locationRequest);

        SettingsClient client = LocationServices.getSettingsClient(activity);
        Task<LocationSettingsResponse> task = client.checkLocationSettings(builder.build());

        task.addOnSuccessListener(res -> {
            if (gpsPromise != null) {
                gpsPromise.resolve("ALREADY_ON");
                gpsPromise = null;
            }
        });

        task.addOnFailureListener(e -> {
            if (e instanceof ResolvableApiException) {
                try {
                    ((ResolvableApiException) e)
                            .startResolutionForResult(activity, 1000);
                } catch (IntentSender.SendIntentException ex) {
                    if (gpsPromise != null) {
                        gpsPromise.reject("ERROR", "Popup failed");
                        gpsPromise = null;
                    }
                }
            } else {
                if (gpsPromise != null) {
                    gpsPromise.reject("UNAVAILABLE", "Not resolvable");
                    gpsPromise = null;
                }
            }
        });
    }

    @ReactMethod
    public void isLocationEnabled(Promise promise) {
        LocationManager lm = (LocationManager)
                reactContext.getSystemService(Context.LOCATION_SERVICE);

        boolean enabled = false;
        if (lm != null) {
            try {
                enabled = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
            } catch (Exception ignored) {}
        }

        promise.resolve(enabled);
    }

    @ReactMethod
    public void getCurrentLocation(Promise promise) {

        if (ActivityCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.ACCESS_FINE_LOCATION
        ) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "Permission missing");
            return;
        }

        fusedClient.getCurrentLocation(
                        Priority.PRIORITY_HIGH_ACCURACY,
                        null
                )
                .addOnSuccessListener(location -> {

                    if (location == null) {
                        promise.reject("NULL", "Location null");
                        return;
                    }

                    WritableMap map = Arguments.createMap();

                    double lat = location.getLatitude();
                    double lon = location.getLongitude();

                    map.putDouble("latitude", lat);
                    map.putDouble("longitude", lon);

                    try {
                        Geocoder geo = new Geocoder(reactContext, Locale.getDefault());
                        List<Address> list = geo.getFromLocation(lat, lon, 1);

                        if (list != null && !list.isEmpty()) {
                            Address a = list.get(0);

                            map.putString("address", safe(a.getAddressLine(0)));
                            map.putString("city", safe(a.getLocality()));
                            map.putString("postalCode", safe(a.getPostalCode()));
                            map.putString("state", safe(a.getAdminArea()));
                        }
                    } catch (IOException e) {
                        clear(map);
                    }

                    map.putString("ipAddress", getIP());

                    promise.resolve(map);
                })
                .addOnFailureListener(e ->
                        promise.reject("ERROR", e.getMessage())
                );
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private void clear(WritableMap map) {
        map.putString("address", "");
        map.putString("city", "");
        map.putString("postalCode", "");
        map.putString("state", "");
    }

    private String getIP() {
        try {
            for (Enumeration<NetworkInterface> en =
                 NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();) {

                NetworkInterface intf = en.nextElement();

                for (Enumeration<InetAddress> enumIpAddr =
                     intf.getInetAddresses(); enumIpAddr.hasMoreElements();) {

                    InetAddress inet = enumIpAddr.nextElement();

                    if (!inet.isLoopbackAddress()
                            && !inet.getHostAddress().contains(":")) {
                        return inet.getHostAddress();
                    }
                }
            }
        } catch (Exception ignored) {}

        return "0.0.0.0";
    }
}