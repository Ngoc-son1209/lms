package com.lms.dev.controller;

import com.lms.dev.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class VerifyController {

    private final UserService authService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping("/verify")
    public org.springframework.web.servlet.view.RedirectView verifyUser(@Param("code") String code) {
        String target = frontendUrl + "/verify-status";

        if (authService.verify(code)) {
            return new org.springframework.web.servlet.view.RedirectView(target + "?success=true");
        }

        return new org.springframework.web.servlet.view.RedirectView(target + "?success=false");
    }
}
