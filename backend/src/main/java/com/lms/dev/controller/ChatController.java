package com.lms.dev.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.dev.service.GroqChatService;

@RestController
@RequestMapping
public class ChatController {

    private final GroqChatService groqChatService;

    public ChatController(GroqChatService groqChatService) {
        this.groqChatService = groqChatService;
    }

    @PostMapping("/chat")
    public String chat(@RequestBody String userMessage) {
        return groqChatService.chatWithGroq(userMessage);
    }
}
