package com.lms.dev.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;
    @Value("${vnpay.hashSecret}")
    private String secretKey;
    @Value("${vnpay.url}")
    private String vnp_Url;
    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    public String createPaymentUrl(String vnpTxnRef, double amount, String orderInfo) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnp_TmnCode);
        params.put("vnp_Amount", String.valueOf((long) (amount * 100)));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", vnpTxnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                if (!fieldName.equals(fieldNames.get(fieldNames.size() - 1))) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        String secureHash = hmacSHA512(secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);
        return vnp_Url + "?" + query;
    }

    private static String hmacSHA512(String key, String data) throws Exception {
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
        hmac512.init(secretKeySpec);
        byte[] bytes = hmac512.doFinal(data.getBytes());
        StringBuilder hash = new StringBuilder();
        for (byte b : bytes) hash.append(String.format("%02x", b));
        return hash.toString();
    }
}
