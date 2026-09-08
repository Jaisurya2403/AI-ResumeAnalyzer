package com.airesume.controller;

import com.airesume.model.User;
import com.airesume.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        Map<String, Object> res = authService.sendOtp(name, email);
        if (Boolean.TRUE.equals(res.get("success"))) {
            return ResponseEntity.ok(res);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        Map<String, Object> res = authService.verifyOtp(email, otp);
        if (Boolean.TRUE.equals(res.get("success"))) {
            return ResponseEntity.ok(res);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String otp = payload.get("otp");
        String password = payload.get("password");

        Map<String, Object> res = authService.registerUser(name, email, otp, password);
        if (Boolean.TRUE.equals(res.get("success"))) {
            return ResponseEntity.ok(res);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        Map<String, Object> res = authService.login(email, password);
        if (Boolean.TRUE.equals(res.get("success"))) {
            return ResponseEntity.ok(res);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Optional<User> optUser = authService.getUserFromToken(authHeader);
        if (optUser.isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("authenticated", false);
            err.put("message", "Invalid or missing authorization token.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        User user = optUser.get();
        Map<String, Object> userDto = new HashMap<>();
        userDto.put("id", user.getId());
        userDto.put("name", user.getName());
        userDto.put("email", user.getEmail());
        userDto.put("role", user.getRole().name());

        Map<String, Object> res = new HashMap<>();
        res.put("authenticated", true);
        res.put("user", userDto);
        return ResponseEntity.ok(res);
    }
}
