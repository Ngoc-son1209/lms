package com.lms.dev.service;

import com.lms.dev.entity.Course;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GroqChatService {

    private final CourseService courseService;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";

    /**
     * Hàm xác định xem người dùng đang hỏi về khóa học hay hỏi kiến thức ngoại ngữ.
     */
    private boolean isCourseRelated(String message) {
        if (message == null) return false;
        String lower = message.toLowerCase();
        
        // Các từ khóa liên quan đến khóa học
        String[] courseKeywords = {
            "khóa học", "học phí", "đăng ký", "lớp", "trung tâm",
            "nên học", "có lớp", "thời gian học", "lịch học", 
            "chương trình", "tư vấn khóa học"
        };
        
        for (String keyword : courseKeywords) {
            if (lower.contains(keyword)) return true;
        }
        return false;
    }

    /**
     * Gửi tin nhắn đến Groq API và nhận phản hồi.
     */
    public String chatWithGroq(String userMessage) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            return "Chưa cấu hình Groq API Key. Vui lòng thêm 'groq.api.key' vào file cấu hình.";
        }

        RestTemplate restTemplate = new RestTemplate();

        // Lấy danh sách khóa học từ DB
        List<Course> courses = courseService.getAllCourses();

        StringBuilder coursesInfo = new StringBuilder();
        if (courses.isEmpty()) {
            coursesInfo.append("Hiện trung tâm chưa có khóa học nào đang hoạt động.\n");
        } else {
            coursesInfo.append("DANH SÁCH KHÓA HỌC:\n");
            for (int i = 0; i < courses.size(); i++) {
                Course c = courses.get(i);
                coursesInfo.append(String.format("""
                        %d. %s
                        - Học phí: %,d VNĐ
                        - Mô tả: %s
                        - Thời gian: %s đến %s
                        - Trạng thái: %s
                        
                        """,
                        (i + 1),
                        c.getCourse_name(),
                        c.getPrice(),
                        c.getDescription() != null && !c.getDescription().isBlank() 
                            ? c.getDescription() : "Chưa có thông tin chi tiết",
                        c.getStartAt() != null ? c.getStartAt() : "Chưa xác định",
                        c.getEndAt() != null ? c.getEndAt() : "Chưa xác định",
                        c.getAvailabilityStatus()
                ));
            }
        }

        // Xác định ý định câu hỏi
        boolean courseIntent = isCourseRelated(userMessage);

        // Chọn System Prompt phù hợp
        String systemPrompt;

        if (courseIntent) {
            // === PROMPT CHO TƯ VẤN KHÓA HỌC ===
            systemPrompt = String.format("""
                BẠN LÀ: Trợ lý tư vấn AI của Trung tâm Ngoại ngữ
                
                NHIỆM VỤ:
                - Tư vấn khóa học phù hợp dựa trên nhu cầu và trình độ của học viên
                - Cung cấp thông tin chính xác về học phí, lịch học, và tình trạng lớp
                - Hỗ trợ quyết định đăng ký khóa học
                
                %s
                
                QUY TẮC TRẢ LỜI:
                1. PHÂN TÍCH nhu cầu: Xác định trình độ, mục tiêu, thời gian của học viên
                2. GỢI Ý tối đa 2-3 khóa học PHÙ HỢP NHẤT, bao gồm:
                ✓ Tên khóa học
                ✓ Học phí (định dạng rõ ràng)
                ✓ Thời gian học (ngày bắt đầu - kết thúc)
                ✓ Trạng thái (Còn chỗ/Đã đầy)
                ✓ Lý do phù hợp với nhu cầu của học viên
                
                3. TRƯỜNG HỢP ĐặC BIỆT:
                - Nếu KHÔNG CÓ khóa phù hợp → Thông báo rõ ràng và hỏi có muốn được thông báo khi có lớp mới
                - Nếu khóa đã FULL → Gợi ý khóa thay thế hoặc hỏi có muốn vào danh sách chờ
                - Nếu câu hỏi CHUNG CHUNG → Đặt câu hỏi làm rõ (trình độ? mục tiêu? thời gian?)
                
                4. PHONG CÁCH:
                - Thân thiện, chuyên nghiệp
                - Ngắn gọn, dễ hiểu
                - Tập trung vào giá trị học viên nhận được
                - KHÔNG đưa thông tin bịa đặt ngoài danh sách
                
                5. CẤM:
                - Giới thiệu khóa không có trong danh sách
                - Nói chung chung, lan man
                - Đưa ra cam kết không có trong dữ liệu
                """, coursesInfo);
                
        } else {
            // === PROMPT CHO HỖ TRỢ HỌC NGOẠI NGỮ ===
            systemPrompt = """
                BẠN LÀ: Trợ lý AI chuyên về giảng dạy và học ngoại ngữ
                
                CHUYÊN MÔN:
                ✓ Ngữ pháp (Grammar) - Giải thích cấu trúc, quy tắc, ngoại lệ
                ✓ Từ vựng (Vocabulary) - Nghĩa, cách dùng, collocation, từ đồng nghĩa
                ✓ Phát âm (Pronunciation) - Phiên âm, trọng âm, ngữ điệu
                ✓ Kỹ năng (Skills) - Nghe, nói, đọc, viết
                ✓ Luyện thi (Test Prep) - TOEIC, IELTS, TOEFL, JLPT, HSK
                
                CÁCH TRẢ LỜI:
                1. GIẢI THÍCH RÕ RÀNG:
                - Dùng ngôn ngữ đơn giản, dễ hiểu
                - Tránh thuật ngữ phức tạp (hoặc giải thích khi dùng)
                - Trình bày có cấu trúc logic
                
                2. CUNG CẤP VÍ DỤ CỤ THỂ:
                - Ít nhất 2-3 ví dụ minh họa
                - Có cả ví dụ đúng và sai (nếu phù hợp)
                - Kèm bản dịch tiếng Việt nếu cần
                
                3. HƯỚNG DẪN THỰC HÀNH:
                - Đưa ra bài tập nhỏ để củng cố
                - Gợi ý cách luyện tập hiệu quả
                - Chỉ ra lỗi thường gặp
                
                4. PHONG CÁCH:
                - Kiên nhẫn, khuyến khích
                - Tích cực, động viên học viên
                - Cá nhân hóa theo trình độ
                
                5. GIỚI HẠN:
                - CHỈ trả lời về ngoại ngữ và học tập
                - KHÔNG tư vấn khóa học (trừ khi được hỏi trực tiếp)
                - Nếu câu hỏi NGOÀI PHẠM VI → Trả lời lịch sự:
                    "Xin lỗi, tôi chỉ hỗ trợ các vấn đề về ngoại ngữ. Bạn có câu hỏi nào về học tập hoặc khóa học không?"
                
                LƯU Ý: Luôn khuyến khích người học, tạo động lực tích cực!
                """;
        }

        // Tạo request body
        Map<String, Object> body = new HashMap<>();
        body.put("model", "qwen/qwen3-32b");
        body.put("temperature", 0.7); // Thêm temperature để kiểm soát độ sáng tạo
        body.put("max_tokens", 1000); // Giới hạn độ dài phản hồi

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
        );

        body.put("messages", messages);

        // Header
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // Gọi API Groq
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                API_URL, HttpMethod.POST, request, Map.class
            );

            if (response.getBody() == null) {
                return "Groq API không trả về dữ liệu.";
            }

            List<Map<String, Object>> choices = 
                (List<Map<String, Object>>) response.getBody().get("choices");
                
            if (choices == null || choices.isEmpty()) {
                return "Không có phản hồi nào từ Groq API.";
            }

            Map<String, Object> choice = choices.get(0);
            Map<String, String> message = (Map<String, String>) choice.get("message");

            return message.getOrDefault("content", "Groq API trả về nội dung rỗng.");

        } catch (HttpClientErrorException e) {
            return "Lỗi phía client (" + e.getStatusCode() + "): " + e.getResponseBodyAsString();
        } catch (HttpServerErrorException e) {
            return "Lỗi phía server (" + e.getStatusCode() + "): " + e.getResponseBodyAsString();
        } catch (ResourceAccessException e) {
            return "Không thể kết nối Groq API. Vui lòng kiểm tra mạng hoặc URL.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi không xác định: " + e.getMessage();
        }
    }
}
