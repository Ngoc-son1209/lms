package com.lms.dev.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class VNPaySignatureService {

    @Value("${vnpay.hashSecret:}")
    private String secretKey;

    public boolean verify(Map<String, String> params) {
        if (params == null || params.isEmpty())
            return false;
        if (secretKey == null || secretKey.isBlank())
            return false;

        String providedHash = params.get("vnp_SecureHash");
        if (providedHash == null || providedHash.isBlank())
            return false;

        // build data string excluding vnp_SecureHash and vnp_SecureHashType
        Map<String, String> filtered = new HashMap<>();
        for (Map.Entry<String, String> e : params.entrySet()) {
            String k = e.getKey();
            String v = e.getValue();
            if (k == null)
                continue;
            if ("vnp_SecureHash".equals(k) || "vnp_SecureHashType".equals(k))
                continue;
            if (v == null)
                v = "";
            filtered.put(k, v);
        }

        List<String> fieldNames = new ArrayList<>(filtered.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = filtered.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName)
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                if (!fieldName.equals(fieldNames.get(fieldNames.size() - 1))) {
                    hashData.append('&');
                }
            }
        }

        try {
            String calculated = hmacSHA512(secretKey, hashData.toString());
            return providedHash.equalsIgnoreCase(calculated);
        } catch (Exception e) {
            return false;
        }
    }

    private static String hmacSHA512(String key, String data) throws Exception {
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
        hmac512.init(secretKeySpec);
        byte[] bytes = hmac512.doFinal(data.getBytes());
        StringBuilder hash = new StringBuilder();
        for (byte b : bytes)
            hash.append(String.format("%02x", b));
        return hash.toString();
    }
}
