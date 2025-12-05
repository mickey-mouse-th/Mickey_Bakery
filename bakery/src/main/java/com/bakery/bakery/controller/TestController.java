package com.bakery.bakery.controller;

import com.bakery.bakery.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TestController {

    private final UserRepository userRepository;

    public TestController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/api/test")
    public String test() {
        return "API is working!";
    }

    @GetMapping("/api/query")
    public List<?> query() {
        return userRepository.findAll();
    }
}
