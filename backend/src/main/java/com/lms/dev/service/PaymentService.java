package com.lms.dev.service;

import com.lms.dev.dto.CreatePaymentResponse;
import com.lms.dev.entity.ClassSection;
import com.lms.dev.entity.Course;
import com.lms.dev.entity.Learning;
import com.lms.dev.entity.Payment;
import com.lms.dev.entity.Progress;
import com.lms.dev.entity.User;
import com.lms.dev.repository.ClassSectionRepository;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.LearningRepository;
import com.lms.dev.repository.PaymentRepository;
import com.lms.dev.repository.ProgressRepository;
import com.lms.dev.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LearningRepository learningRepository;
    private final ProgressRepository progressRepository;
    private final ClassSectionRepository classSectionRepository;
    private final VNPayService vnPayService;
    private final CourseAvailabilityService courseAvailabilityService;

    /**
     * # NOTE: Tạo giao dịch thanh toán cho 1 khóa học.
     * - Không nhận amount từ client (lấy từ course.price)
     * - Không nhận userId từ client (lấy từ JWT principal -> controller sẽ truyền vào)
     * - Chặn mua trùng nếu đã enroll (Learning unique user+course)
     */
    @Transactional
    public CreatePaymentResponse createCoursePayment(UUID userId, UUID courseId) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Chặn mua trùng
        Learning existing = learningRepository.findByUserAndCourse(user, course);
        if (existing != null) {
            throw new IllegalStateException("Bạn đã mua/đăng ký khóa học này rồi");
        }

        // Chặn thanh toán nếu khóa học đã kết thúc
        // Quy ước: nếu endAt != null và endAt < today => course ended
        if (course.getEndAt() != null && course.getEndAt().isBefore(java.time.LocalDate.now())) {
            throw new IllegalStateException("Khóa học đã kết thúc, không thể thanh toán");
        }

        // Chặn thanh toán nếu FULL
        courseAvailabilityService.refreshAndSave(course);
        if ("FULL".equalsIgnoreCase(course.getAvailabilityStatus())) {
            throw new IllegalStateException("Khóa học hiện đã hết chỗ. Vui lòng thử lại sau");
        }

        double amount = (double) course.getPrice();
        String vnpTxnRef = String.valueOf(System.currentTimeMillis());
        String orderInfo = "Thanh toan khoa hoc " + courseId + " - " + vnpTxnRef;

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setCourseId(courseId);
        payment.setAmount(amount);
        payment.setStatus("PENDING");
        payment.setOrderInfo(orderInfo);
        payment.setVnpTxnRef(vnpTxnRef);
        paymentRepository.save(payment);

        String url = vnPayService.createPaymentUrl(vnpTxnRef, amount, orderInfo);

        return CreatePaymentResponse.builder()
                .paymentId(payment.getId())
                .vnpTxnRef(vnpTxnRef)
                .paymentUrl(url)
                .amount(amount)
                .courseId(courseId)
                .build();
    }

    /**
     * # NOTE: Sau khi thanh toán thành công, tạo Learning + Progress và auto-assign lớp còn trống.
     * Nếu hết lớp (race condition), vẫn enroll nhưng classSection = null.
     */
    @Transactional
    public void fulfillPaidPayment(Payment payment) {
        if (payment == null) return;
        if (!"PAID".equalsIgnoreCase(payment.getStatus())) return;

        UUID userId = payment.getUserId();
        UUID courseId = payment.getCourseId();
        if (userId == null || courseId == null) return;

        User user = userRepository.findById(userId).orElse(null);
        Course course = courseRepository.findById(courseId).orElse(null);
        if (user == null || course == null) return;

        // Idempotent: nếu đã có learning thì không tạo nữa
        Learning existing = learningRepository.findByUserAndCourse(user, course);
        if (existing != null) {
            return;
        }

        Progress progress = new Progress();
        progress.setUser(user);
        progress.setCourse(course);
        progressRepository.save(progress);

        Learning learning = new Learning();
        learning.setUser(user);
        learning.setCourse(course);

        ClassSection assigned = findAvailableClassSection(course);
        learning.setClassSection(assigned); // assigned có thể null theo yêu cầu

        learningRepository.save(learning);

        // refresh course availability after enrollment
        try {
            courseAvailabilityService.refreshAndSave(course);
        } catch (Exception ignored) {
        }
    }

    private ClassSection findAvailableClassSection(Course course) {
        List<ClassSection> activeSections = classSectionRepository.findByCourseAndStatus(course, "ACTIVE");
        if (activeSections == null || activeSections.isEmpty()) return null;

        // chọn lớp còn chỗ; ưu tiên lớp có ít học viên nhất
        return activeSections.stream()
                .filter(cs -> {
                    Integer cap = cs.getCapacity();
                    if (cap == null) return true;
                    long cnt = learningRepository.countByClassSection(cs);
                    return cnt < cap;
                })
                .min(Comparator.comparingLong(cs -> learningRepository.countByClassSection(cs)))
                .orElse(null);
    }

    public Optional<Payment> findByTxnRef(String txnRef) {
        return paymentRepository.findByVnpTxnRef(txnRef);
    }
}

