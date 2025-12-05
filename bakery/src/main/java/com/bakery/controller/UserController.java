// src/main/java/com/bakery/controller/UserController.java
package com.bakery.controller;

import com.bakery.bakery.entity.User;
import com.bakery.bakery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // API test
    @GetMapping("/test")
    public Map<String, String> test() {
        return Map.of("time", LocalDateTime.now().toString());
    }

    // API query all users
    @GetMapping("/query")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
