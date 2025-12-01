package com.lms.dev.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GroqChatService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public String chatWithGroq(String userMessage) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            return "Groq API key is not configured. Please set 'groq.api.key' in application.yml or environment variable GROQ_API_KEY.";
        }
        RestTemplate restTemplate = new RestTemplate();

        // ✅ Chuẩn bị nội dung gửi đi
        Map<String, Object> body = new HashMap<>();
        body.put("model", "qwen/qwen3-32b");
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", "You are a helpful assistant."),
                Map.of("role", "user", "content", userMessage));
        body.put("messages", messages);

        // ✅ Header
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    API_URL, HttpMethod.POST, request, Map.class);

            // ✅ Kiểm tra body phản hồi
            if (response.getBody() == null) {
                return "⚠️ Groq API returned an empty response.";
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices == null || choices.isEmpty()) {
                return "⚠️ No choices returned from Groq API.";
            }

            Map<String, Object> choice = choices.get(0);
            Map<String, String> message = (Map<String, String>) choice.get("message");

            return message.getOrDefault("content", "⚠️ Empty message content from Groq API.");

        } catch (HttpClientErrorException e) {
            // ❌ Lỗi 4xx (client)
            System.err.println("❌ HTTP Client Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return "❌ Groq API client error: " + e.getStatusCode();
        } catch (HttpServerErrorException e) {
            // ❌ Lỗi 5xx (server Groq)
            System.err.println("❌ HTTP Server Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return "❌ Groq server error: " + e.getStatusCode();
        } catch (ResourceAccessException e) {
            // ❌ Lỗi kết nối (timeout, không mạng, v.v.)
            System.err.println("❌ Network error when calling Groq API: " + e.getMessage());
            return "❌ Cannot reach Groq API. Please check your internet connection or API URL.";
        } catch (Exception e) {
            // ❌ Các lỗi khác (JSON parsing, null, v.v.)
            e.printStackTrace();
            return "❌ Unexpected error when calling Groq API: " + e.getMessage();
        }
    }
}
