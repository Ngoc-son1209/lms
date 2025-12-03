package com.lms.dev.service;

import com.lms.dev.dto.InstructorAdminDTO;
import com.lms.dev.dto.InstructorRegisterDTO;
import com.lms.dev.dto.InstructorProfileDTO;
import com.lms.dev.entity.Instructor;
import com.lms.dev.entity.User;
import com.lms.dev.enums.ApprovalStatus;
import com.lms.dev.enums.UserRole;
import com.lms.dev.repository.InstructorRepository;
import com.lms.dev.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final JavaMailSender mailSender;

    public void registerInstructor(InstructorRegisterDTO dto, String siteURL)
            throws MessagingException, UnsupportedEncodingException {
        // Tạo User với vai trò INSTRUCTOR (để login bằng bảng users)
        User user = User.builder()
                .username(dto.getFullName())
                .email(dto.getEmail())
                .password(dto.getPassword()) // sẽ được encode trong createUser
                .mobileNumber(dto.getMobileNumber())
                .dob(dto.getDob())
                .gender(dto.getGender())
                .location(dto.getLocation())
                .profession(dto.getProfession())
                .role(UserRole.INSTRUCTOR)
                .build();
        // Instructor phải chờ duyệt → approved = false; vẫn cần verify email
        user.setApproved(false);
        userService.createUser(user, siteURL);

        // Lưu hồ sơ Instructor riêng (profile)
        Instructor instructor = Instructor.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .bio(dto.getBio())
                .expertise(dto.getExpertise())
                .status(ApprovalStatus.PENDING)
                .build();
        instructorRepository.save(instructor);
    }

    private InstructorAdminDTO toAdminDTO(Instructor instructor, User user) {
        return InstructorAdminDTO.builder()
                .id(instructor.getId())
                .userId(user != null ? user.getId() : null)
                .fullName(instructor.getFullName())
                .email(instructor.getEmail())
                .bio(instructor.getBio())
                .expertise(instructor.getExpertise())
                .status(instructor.getStatus() != null ? instructor.getStatus().name() : null)
                .rejectReason(instructor.getRejectReason())
                .mobileNumber(user != null ? user.getMobileNumber() : null)
                .dob(user != null ? user.getDob() : null)
                .gender(user != null ? user.getGender() : null)
                .location(user != null ? user.getLocation() : null)
                .profession(user != null ? user.getProfession() : null)
                .emailVerified(user != null && user.isEnabled())
                .approved(user != null && user.isApproved())
                .createdAt(instructor.getCreatedAt())
                .updatedAt(instructor.getUpdatedAt())
                .build();
    }

    public List<InstructorAdminDTO> getPendingInstructors() {
        List<Instructor> list = instructorRepository.findByStatus(ApprovalStatus.PENDING);
        List<InstructorAdminDTO> result = new ArrayList<>();
        for (Instructor ins : list) {
            User u = userRepository.findByEmail(ins.getEmail());
            result.add(toAdminDTO(ins, u));
        }
        return result;
    }

    public Optional<Instructor> approveInstructor(UUID id) {
        Optional<Instructor> opt = instructorRepository.findById(id);
        opt.ifPresent(instructor -> {
            // Cập nhật trạng thái hồ sơ
            instructor.setStatus(ApprovalStatus.APPROVED);
            instructor.setRejectReason(null);
            instructor.setRejectedAt(null);
            instructorRepository.save(instructor);

            // Gửi email thông báo đã được duyệt
            try {
                sendApprovalEmail(instructor.getEmail(), instructor.getFullName());
            } catch (Exception e) {
                e.printStackTrace();
            }

            // Duyệt ở bảng users theo email
            User user = userRepository.findByEmail(instructor.getEmail());
            if (user != null) {
                user.setApproved(true);
                userRepository.save(user);
            }
        });
        return opt;
    }

    public List<InstructorAdminDTO> getApprovedInstructors() {
        List<Instructor> list = instructorRepository.findByStatus(ApprovalStatus.APPROVED);
        List<InstructorAdminDTO> result = new ArrayList<>();
        for (Instructor ins : list) {
            User u = userRepository.findByEmail(ins.getEmail());
            result.add(toAdminDTO(ins, u));
        }
        return result;
    }

    public List<InstructorAdminDTO> getResignedInstructors() {
        List<Instructor> list = instructorRepository.findByStatus(ApprovalStatus.RESIGNED);
        List<InstructorAdminDTO> result = new ArrayList<>();
        for (Instructor ins : list) {
            User u = userRepository.findByEmail(ins.getEmail());
            result.add(toAdminDTO(ins, u));
        }
        return result;
    }

    public Optional<InstructorAdminDTO> updateInstructor(UUID id, InstructorAdminDTO dto) {
        Optional<Instructor> opt = instructorRepository.findById(id);
        if (opt.isEmpty())
            return Optional.empty();
        Instructor ins = opt.get();
        if (dto.getFullName() != null)
            ins.setFullName(dto.getFullName());
        if (dto.getBio() != null)
            ins.setBio(dto.getBio());
        if (dto.getExpertise() != null)
            ins.setExpertise(dto.getExpertise());
        instructorRepository.save(ins);

        User user = userRepository.findByEmail(ins.getEmail());
        if (user != null) {
            if (dto.getMobileNumber() != null)
                user.setMobileNumber(dto.getMobileNumber());
            if (dto.getDob() != null)
                user.setDob(dto.getDob());
            if (dto.getGender() != null)
                user.setGender(dto.getGender());
            if (dto.getLocation() != null)
                user.setLocation(dto.getLocation());
            if (dto.getProfession() != null)
                user.setProfession(dto.getProfession());
            userRepository.save(user);
        }
        return Optional.of(toAdminDTO(ins, user));
    }

    @Transactional
    public Optional<InstructorAdminDTO> rejectInstructor(UUID id, String reason) {
        Optional<Instructor> opt = instructorRepository.findById(id);
        if (opt.isEmpty())
            return Optional.empty();
        Instructor ins = opt.get();

        // Gửi email thông báo từ chối
        try {
            sendRejectionEmail(ins.getEmail(), ins.getFullName(), reason);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Xóa tài khoản và hồ sơ theo nghiệp vụ yêu cầu
        User user = userRepository.findByEmail(ins.getEmail());
        if (user != null) {
            userRepository.delete(user);
        }
        instructorRepository.delete(ins);

        return Optional.of(toAdminDTO(ins, user));
    }

    @Transactional
    public Optional<InstructorAdminDTO> resignInstructor(UUID id) {
        Optional<Instructor> opt = instructorRepository.findById(id);
        if (opt.isEmpty())
            return Optional.empty();
        Instructor ins = opt.get();
        ins.setStatus(ApprovalStatus.RESIGNED);
        instructorRepository.save(ins);

        User user = userRepository.findByEmail(ins.getEmail());
        if (user != null) {
            // Hạ quyền về USER để vẫn có thể đăng nhập như học viên
            user.setApproved(false); // phòng hờ nếu logic cũ còn kiểm tra approved
            user.setRole(UserRole.USER);
            userRepository.save(user);
        }
        return Optional.of(toAdminDTO(ins, user));
    }

    public com.lms.dev.dto.InstructorProfileDTO getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email);
        java.util.Optional<Instructor> optIns = instructorRepository.findByEmail(email);
        Instructor ins = optIns.orElse(null);
        if (user == null && ins == null)
            return null;
        return com.lms.dev.dto.InstructorProfileDTO.builder()
                .username(user != null ? user.getUsername() : (ins != null ? ins.getFullName() : null))
                .email(email)
                .mobileNumber(user != null ? user.getMobileNumber() : null)
                .dob(user != null ? user.getDob() : null)
                .gender(user != null ? user.getGender() : null)
                .location(user != null ? user.getLocation() : null)
                .profession(user != null ? user.getProfession() : null)
                .bio(ins != null ? ins.getBio() : null)
                .expertise(ins != null ? ins.getExpertise() : null)
                .build();
    }

    public com.lms.dev.dto.InstructorProfileDTO updateProfileByEmail(String email,
            com.lms.dev.dto.InstructorProfileDTO dto) {
        User user = userRepository.findByEmail(email);
        Instructor ins = instructorRepository.findByEmail(email).orElse(null);
        if (user != null) {
            if (dto.getUsername() != null)
                user.setUsername(dto.getUsername());
            if (dto.getMobileNumber() != null)
                user.setMobileNumber(dto.getMobileNumber());
            if (dto.getDob() != null)
                user.setDob(dto.getDob());
            if (dto.getGender() != null)
                user.setGender(dto.getGender());
            if (dto.getLocation() != null)
                user.setLocation(dto.getLocation());
            if (dto.getProfession() != null)
                user.setProfession(dto.getProfession());
            userRepository.save(user);
        }
        if (ins == null) {
            // create skeleton if missing
            ins = Instructor.builder()
                    .email(email)
                    .fullName(
                            dto.getUsername() != null ? dto.getUsername() : (user != null ? user.getUsername() : null))
                    .bio(dto.getBio())
                    .expertise(dto.getExpertise())
                    .status(com.lms.dev.enums.ApprovalStatus.PENDING)
                    .build();
        } else {
            if (dto.getUsername() != null)
                ins.setFullName(dto.getUsername());
            if (dto.getBio() != null)
                ins.setBio(dto.getBio());
            if (dto.getExpertise() != null)
                ins.setExpertise(dto.getExpertise());
        }
        instructorRepository.save(ins);
        return getProfileByEmail(email);
    }

    private void sendRejectionEmail(String toEmail, String fullName, String reason)
            throws MessagingException, UnsupportedEncodingException {
        String fromAddress = "anhsonss1209@gmail.com";
        String senderName = "Ocean Edu";
        String subject = "Ứng tuyển giảng viên - Bị từ chối";
        String content = "<p>Xin chào [[name]],</p>"
                + "<p>Rất tiếc, hồ sơ ứng tuyển giảng viên của bạn đã bị từ chối.</p>"
                + "<p><strong>Lý do:</strong> [[reason]]</p>"
                + "<p>Bạn có thể cập nhật hồ sơ và đăng ký lại sau.</p>"
                + "<br><p>Trân trọng,<br>OceanEdu Team</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        helper.setFrom(fromAddress, senderName);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        content = content.replace("[[name]]", fullName == null ? "bạn" : fullName);
        content = content.replace("[[reason]]", reason == null || reason.isBlank() ? "Không được cung cấp" : reason);
        helper.setText(content, true);
        mailSender.send(message);
    }

    private void sendApprovalEmail(String toEmail, String fullName)
            throws MessagingException, UnsupportedEncodingException {
        String fromAddress = "anhsonss1209@gmail.com";
        String senderName = "Ocean Edu";
        String subject = "Ứng tuyển giảng viên - ĐÃ ĐƯỢC DUYỆT";
        String content = "<p>Xin chào [[name]],</p>"
                + "<p>Chúc mừng! Hồ sơ ứng tuyển giảng viên của bạn đã được duyệt.</p>"
                + "<p>Bạn có thể đăng nhập và bắt đầu sử dụng các tính năng dành cho giảng viên.</p>"
                + "<br><p>Trân trọng,<br>OceanEdu Team</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        helper.setFrom(fromAddress, senderName);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        content = content.replace("[[name]]", fullName == null ? "bạn" : fullName);
        helper.setText(content, true);
        mailSender.send(message);
    }
}
