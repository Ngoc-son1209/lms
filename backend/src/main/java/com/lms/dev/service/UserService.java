package com.lms.dev.service;

import lombok.RequiredArgsConstructor;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.lms.dev.entity.User;
import com.lms.dev.exception.DuplicateResourceException;
import com.lms.dev.repository.UserRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.lms.dev.enums.UserRole;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // # NOTE: Thời gian sống của reset token (15 phút)
    private static final long RESET_TOKEN_EXPIRY_MINUTES = 15;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id).orElse(null);
    }

    public void createUser(User user, String siteURL)
            throws UnsupportedEncodingException, MessagingException {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateResourceException("Email này đã được sử dụng");
        }
        if (user.getMobileNumber() != null && !user.getMobileNumber().isEmpty() &&
                userRepository.existsByMobileNumber(user.getMobileNumber())) {
            throw new DuplicateResourceException("Số điện thoại này đã được sử dụng");
        }

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        String randomCode = RandomStringUtils.randomAlphanumeric(64);
        user.setVerificationCode(randomCode);
        user.setEnabled(false);

        userRepository.save(user);

        sendVerificationEmail(user, siteURL);
    }

    private void sendVerificationEmail(User user, String siteURL)
            throws MessagingException, UnsupportedEncodingException {
        String toAddress = user.getEmail();
        String fromAddress = "anhsonss1209@gmail.com";
        String senderName = "Ocean Edu";
        String subject = "Please verify your registration";
        String content = "<p>Xin chào [[name]],</p>"
                + "<p>Vui lòng nhấp vào liên kết bên dưới để xác minh tài khoản của bạn:</p>"
                + "<p><a href=\"[[URL]]\">XÁC MINH TÀI KHOẢN</a></p>"
                + "<br>"
                + "<p>Cảm ơn,<br>OceanEdu Team</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(fromAddress, senderName);
        helper.setTo(toAddress);
        helper.setSubject(subject);

        content = content.replace("[[name]]", user.getUsername());
        String verifyURL = siteURL + "/verify?code=" + user.getVerificationCode();

        content = content.replace("[[URL]]", verifyURL);

        helper.setText(content, true);

        mailSender.send(message);
    }

    public boolean verify(String verificationCode) {
        User user = userRepository.findByVerificationCode(verificationCode);

        if (user == null || user.isEnabled()) {
            return false;
        } else {
            user.setVerificationCode(null);
            user.setEnabled(true);
            userRepository.save(user);
            return true;
        }
    }

    // # NOTE: Gửi email reset password với reset token
    public void sendPasswordResetEmail(User user, String siteURL)
            throws MessagingException, UnsupportedEncodingException {

        // # NOTE: Tạo reset token ngẫu nhiên
        String resetToken = RandomStringUtils.randomAlphanumeric(64);

        // # NOTE: Lưu token và thời gian hết hạn vào database
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES));
        userRepository.save(user);

        String toAddress = user.getEmail();
        String fromAddress = "anhsonss1209@gmail.com";
        String senderName = "Ocean Edu";
        String subject = "Reset your password";
        String content = "<p>Xin chào [[name]],</p>"
                + "<p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết bên dưới:</p>"
                + "<p><a href=\"[[URL]]\">ĐẶT LẠI MẬT KHẨU</a></p>"
                + "<p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn trong 15 phút</p>"
                + "<br>"
                + "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>"
                + "<p>Cảm ơn,<br>OceanEdu Team</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(fromAddress, senderName);
        helper.setTo(toAddress);
        helper.setSubject(subject);

        content = content.replace("[[name]]", user.getUsername());
        String resetURL = frontendUrl + "/reset-password?token=" + resetToken;
        content = content.replace("[[URL]]", resetURL);

        helper.setText(content, true);

        mailSender.send(message);
    }

    // # NOTE: Xác thực reset token và cập nhật mật khẩu
    public boolean resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token);

        if (user == null) {
            return false;
        }

        // # NOTE: Kiểm tra token có hết hạn không
        if (user.getPasswordResetTokenExpiry() == null ||
                LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiry())) {
            return false;
        }

        // # NOTE: Cập nhật mật khẩu và xóa reset token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return true;
    }

    public void updateUserProfile(MultipartFile file, UUID id) throws IOException {
        User user = getUserById(id);
        if (user == null)
            return;
        user.setProfileImage(file.getBytes());
        userRepository.save(user);
    }

    public User updateUser(UUID id, User updatedUser) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            existingUser.setUsername(updatedUser.getUsername());
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setDob(updatedUser.getDob());
            existingUser.setMobileNumber(updatedUser.getMobileNumber());
            existingUser.setGender(updatedUser.getGender());
            existingUser.setLocation(updatedUser.getLocation());
            existingUser.setProfession(updatedUser.getProfession());

            return userRepository.save(existingUser);
        }
        return null;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User authenticateUser(String email, String rawPassword) {
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(rawPassword, user.getPassword())) {
            return user;
        }
        return null;
    }

    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }
}