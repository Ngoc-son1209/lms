package com.lms.dev.controller;

import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


import com.lms.dev.service.UserService;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class VerifyController {

    private final UserService authService;
    

    @GetMapping("/verify")
    public String verifyUser(@Param("code") String code) {
        if (authService.verify(code)) {
            return "verify_success";
        } else {
            return "verify_fail";
        }
    }
}
