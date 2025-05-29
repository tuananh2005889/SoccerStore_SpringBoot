package com.BackEnd.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Map;
import java.util.TreeMap;
import java.nio.charset.StandardCharsets;

public class SignatureUtil {
    public static String createSignature(Map<String, String> data, String checksumKey) throws Exception {
        Map<String, String> sorted = new TreeMap<>(data);

        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : sorted.entrySet()) {
            sb.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
        }
        String rawData = sb.substring(0, sb.length() - 1); // remove last '&'

        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSha256.init(secretKey);
        byte[] hash = hmacSha256.doFinal(rawData.getBytes(StandardCharsets.UTF_8));

        StringBuilder hexResult = new StringBuilder();
        for (byte b : hash) {
            hexResult.append(String.format("%02x", b));
        }

        return hexResult.toString();
    }
}