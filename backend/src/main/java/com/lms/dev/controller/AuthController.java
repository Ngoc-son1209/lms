package com.lms.dev.controller;

import com.lms.dev.dto.ApiResponse;
import com.lms.dev.dto.JwtResponseDTO;
import com.lms.dev.dto.LoginRequestDTO;
import com.lms.dev.entity.User;
import com.lms.dev.enums.UserRole;
import com.lms.dev.exception.DuplicateResourceException;
import com.lms.dev.security.UserPrincipal;
import com.lms.dev.security.util.JwtUtils;
import com.lms.dev.service.UserService;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.UnsupportedEncodingException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponseDTO>> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        log.info("Login attempt for email: {}", loginRequest.getEmail());

        try {
            // # NOTE: Kiểm tra tài khoản có tồn tại không
            User user = authService.getUserByEmail(loginRequest.getEmail());
            if (user == null) {
                log.warn("Login failed - User not found: {}", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>("Email hoặc mật khẩu không chính xác", null));
            }

            // # NOTE: Kiểm tra tài khoản đã kích hoạt chưa
            if (!user.isEnabled()) {
                log.warn("Login failed - Account not activated: {}", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>(
                                "Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email để xác thực", null));
            }

            // # NOTE: Chặn giảng viên chưa được admin duyệt
            if (user.getRole() == UserRole.INSTRUCTOR && !user.isApproved()) {
                log.warn("Login failed - Instructor not approved: {}", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>(
                                "Tài khoản giảng viên của bạn đang chờ duyệt. Vui lòng chờ Admin phê duyệt.", null));
            }

            // # NOTE: Xác thực người dùng
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            JwtResponseDTO jwtResponse = JwtResponseDTO.builder()
                    .token(jwt)
                    .type("Bearer")
                    .id(userPrincipal.getId())
                    .email(userPrincipal.getEmail())
                    .name(userPrincipal.getName())
                    .role(userPrincipal.getAuthorities().iterator().next().getAuthority())
                    .build();

            log.info("User logged in successfully: {}", loginRequest.getEmail());
            return ResponseEntity.ok(new ApiResponse<>("Login successful", jwtResponse));

        } catch (AuthenticationException e) {
            // # NOTE: Xử lý lỗi xác thực (sai mật khẩu)
            log.warn("Login failed - Invalid credentials for email: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>("Email hoặc mật khẩu không chính xác", null));
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi server, vui lòng thử lại", null));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody User signUpRequest,
            HttpServletRequest request) {
        try {
            log.info("Registration attempt for email: {}", signUpRequest.getEmail());

            String siteURL = getSiteURL(request);
            authService.createUser(signUpRequest, siteURL);

            log.info("User registered successfully: {}", signUpRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(
                            "User registered successfully. Please check your email to verify your account.", null));

        } catch (DuplicateResourceException e) {
            log.warn("Registration failed - Duplicate resource: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>(e.getMessage(), null));

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Registration failed - Email error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to send verification email", null));
        }
    }

    // # NOTE: Endpoint quên mật khẩu - Gửi email reset password
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email, HttpServletRequest request) {
        try {
            log.info("Forgot password request for email: {}", email);

            User user = authService.getUserByEmail(email);
            if (user == null) {
                // # NOTE: Không tiết lộ email có tồn tại hay không (bảo mật)
                log.warn("Forgot password - Email not found: {}", email);
                return ResponseEntity
                        .ok(new ApiResponse<>("Nếu email tồn tại, bạn sẽ nhận được link reset password", null));
            }

            String siteURL = getSiteURL(request);
            authService.sendPasswordResetEmail(user, siteURL);

            log.info("Password reset email sent to: {}", email);
            return ResponseEntity
                    .ok(new ApiResponse<>("Nếu email tồn tại, bạn sẽ nhận được link reset password", null));

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Forgot password - Email error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi gửi email, vui lòng thử lại", null));
        }
    }

    // # NOTE: Endpoint reset mật khẩu - Xác thực token và cập nhật mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestParam String token,
            @RequestParam String newPassword) {
        try {
            log.info("Reset password attempt");

            boolean success = authService.resetPassword(token, newPassword);

            if (success) {
                log.info("Password reset successfully");
                return ResponseEntity
                        .ok(new ApiResponse<>("Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại", null));
            } else {
                log.warn("Reset password failed - Invalid or expired token");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>("Link reset password không hợp lệ hoặc đã hết hạn", null));
            }

        } catch (Exception e) {
            log.error("Reset password error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi server, vui lòng thử lại", null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new ApiResponse<>("Logout successful", null));
    }

    private String getSiteURL(HttpServletRequest request) {
        String siteURL = request.getRequestURL().toString();
        return siteURL.replace(request.getServletPath(), "");
    }
}