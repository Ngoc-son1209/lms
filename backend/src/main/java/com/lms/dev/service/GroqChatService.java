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

    // Lấy API Key từ application.properties/yml hoặc biến môi trường
    @Value("${groq.api.key:}")
    private String groqApiKey;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";

    // 🌟 Định nghĩa System Prompt (Hướng dẫn hệ thống) cho vai trò chuyên biệt 🌟
    // System Prompt này sẽ giới hạn chatbot chỉ trả lời về ngoại ngữ.
    private static final String SYSTEM_PROMPT = """
            Bạn là Trợ lý AI của Trung tâm Ngoại ngữ.
            Nhiệm vụ của bạn là **CHỈ** cung cấp hỗ trợ và thông tin liên quan đến các vấn đề:
            1. Ngoại ngữ (ngữ pháp, từ vựng, mẹo học, bài tập, phát âm).
            2. Các khóa học, lịch học, học phí và dịch vụ của trung tâm.
            3. Luyện thi chứng chỉ ngôn ngữ (TOEIC, IELTS, JLPT, v.v.).

            QUY TẮC BẮT BUỘC:
            - Nếu người dùng hỏi bất kỳ câu hỏi nào **KHÔNG LIÊN QUAN** (ví dụ: thời tiết, công thức nấu ăn, tin tức chính trị, lập trình, v.v.), bạn phải lịch sự từ chối.
            - Câu trả lời từ chối MẪU: 'Xin lỗi, tôi chỉ có thể hỗ trợ các vấn đề liên quan đến ngoại ngữ và các khóa học tại trung tâm. Bạn có câu hỏi nào về tiếng Anh, tiếng Nhật, hay các ngôn ngữ khác không?'
            - Duy trì thái độ chuyên nghiệp và thân thiện, tập trung vào giáo dục ngôn ngữ.
            """;

    /**
     * Gửi tin nhắn đến Groq API và nhận phản hồi.
     * 
     * @param userMessage Tin nhắn của người dùng.
     * @return Phản hồi từ Groq hoặc thông báo lỗi.
     */
    public String chatWithGroq(String userMessage) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            return "Groq API key is not configured. Please set 'groq.api.key' in application.yml or environment variable GROQ_API_KEY.";
        }
        RestTemplate restTemplate = new RestTemplate();

        // 1. Thiết lập nội dung yêu cầu (Body)
        Map<String, Object> body = new HashMap<>();
        // Sử dụng mô hình bạn đã chọn
        body.put("model", "qwen/qwen3-32b");

        // Tạo danh sách tin nhắn bao gồm System Prompt và tin nhắn người dùng
        List<Map<String, String>> messages = new ArrayList<>();

        // 1a. Thêm System Prompt (Đảm bảo vai trò và giới hạn chủ đề)
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        // 1b. Thêm tin nhắn của người dùng
        messages.add(Map.of("role", "user", "content", userMessage));

        body.put("messages", messages);

        // 2. Thiết lập Header
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // 3. Gọi API và xử lý phản hồi
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    API_URL, HttpMethod.POST, request, Map.class);

            // Kiểm tra và trích xuất nội dung tin nhắn
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
            // Xử lý Lỗi 4xx (ví dụ: Key không hợp lệ, lỗi cú pháp yêu cầu)
            System.err.println("❌ HTTP Client Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return "❌ Groq API client error: " + e.getStatusCode() + ". Chi tiết: " + e.getResponseBodyAsString();
        } catch (HttpServerErrorException e) {
            // Xử lý Lỗi 5xx (Lỗi từ Server Groq)
            System.err.println("❌ HTTP Server Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return "❌ Groq server error: " + e.getStatusCode();
        } catch (ResourceAccessException e) {
            // Xử lý Lỗi kết nối mạng
            System.err.println("❌ Network error when calling Groq API: " + e.getMessage());
            return "❌ Cannot reach Groq API. Please check your internet connection or API URL.";
        } catch (Exception e) {
            // Xử lý các lỗi chung khác
            e.printStackTrace();
            return "❌ Unexpected error when calling Groq API: " + e.getMessage();
        }
    }
}