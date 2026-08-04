// package com.pemudra;

// import okhttp3.OkHttpClient;
// import javax.net.ssl.*;
// import java.security.cert.CertificateException;

// public class UnsafeOkHttpClient {

//     public static OkHttpClient getUnsafeOkHttpClient() {
//         try {

//             final TrustManager[] trustAllCerts = new TrustManager[]{
//                 new X509TrustManager() {
//                     public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {}
//                     public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {}
//                     public java.security.cert.X509Certificate[] getAcceptedIssuers() { return new java.security.cert.X509Certificate[]{}; }
//                 }
//             };

//             final SSLContext sslContext = SSLContext.getInstance("SSL");
//             sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

//             final SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

//             OkHttpClient.Builder builder = new OkHttpClient.Builder();
//             builder.sslSocketFactory(sslSocketFactory, (X509TrustManager)trustAllCerts[0]);
//             builder.hostnameVerifier((hostname, session) -> true);

//             return builder.build();

//         } catch (Exception e) {
//             throw new RuntimeException(e);
//         }
//     }
// }


package com.pemudra;

import okhttp3.OkHttpClient;
import javax.net.ssl.*;
import java.security.cert.CertificateException;
import java.util.concurrent.TimeUnit;

public class UnsafeOkHttpClient {

    public static OkHttpClient getUnsafeOkHttpClient() {
        try {

            final TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {}
                    public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {}
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() { return new java.security.cert.X509Certificate[]{}; }
                }
            };

            final SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

            final SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

            OkHttpClient.Builder builder = new OkHttpClient.Builder();
            builder.sslSocketFactory(sslSocketFactory, (X509TrustManager)trustAllCerts[0]);
            builder.hostnameVerifier((hostname, session) -> true);

           
            builder.connectTimeout(30, TimeUnit.SECONDS);
            builder.readTimeout(120, TimeUnit.SECONDS);
            builder.writeTimeout(120, TimeUnit.SECONDS);
            builder.callTimeout(150, TimeUnit.SECONDS);

            return builder.build();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}