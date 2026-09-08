package com.airesume.service;

import com.airesume.model.OtpToken;
import com.airesume.model.Role;
import com.airesume.model.User;
import com.airesume.repository.OtpTokenRepository;
import com.airesume.repository.UserRepository;
import com.airesume.security.JwtUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^_-])[A-Za-z\\d@$!%*?&#^_-]{8,}$");
    private static final SecureRandom RANDOM = new SecureRandom();

    @PostConstruct
    public void initDefaultAdmin() {
        try {
            String adminEmail = "admin@gmail.com";
            if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
                User admin = User.builder()
                        .name("System Administrator")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Admin@1234"))
                        .role(Role.ADMIN)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                userRepository.save(admin);
                System.out.println("Default Admin Account Initialized: " + adminEmail + " (Role: ADMIN)");
            }
        } catch (Exception e) {
            System.err.println("Could not seed default admin account: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> sendOtp(String name, String email) {
        Map<String, Object> result = new HashMap<>();

        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            result.put("success", false);
            result.put("message", "Please provide a valid email address.");
            return result;
        }

        String cleanEmail = email.trim().toLowerCase();

        // 1. Check if email is already registered
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            result.put("success", false);
            result.put("message", "This email address is already registered. Please sign in instead.");
            return result;
        }

        // 2. Generate 6-digit cryptographic OTP code
        int code = 100000 + RANDOM.nextInt(900000);
        String otpCode = String.valueOf(code);

        // 3. Save OTP in DB with 10-minute expiry
        OtpToken token = OtpToken.builder()
                .email(cleanEmail)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .isVerified(false)
                .createdAt(LocalDateTime.now())
                .build();
        otpTokenRepository.save(token);

        // 4. Dispatch OTP Email
        boolean sent = emailNotificationService.sendSignupOtp(cleanEmail, name, otpCode);

        result.put("success", true);
        result.put("message", "Verification code sent to " + cleanEmail);
        result.put("email", cleanEmail);
        result.put("emailSent", sent);
        return result;
    }

    @Transactional
    public Map<String, Object> verifyOtp(String email, String otpCode) {
        Map<String, Object> result = new HashMap<>();

        if (email == null || otpCode == null || otpCode.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "Email and OTP code are required.");
            return result;
        }

        String cleanEmail = email.trim().toLowerCase();
        String cleanOtp = otpCode.trim();

        Optional<OtpToken> optToken = otpTokenRepository.findTopByEmailIgnoreCaseAndOtpCodeAndIsVerifiedFalseOrderByCreatedAtDesc(cleanEmail, cleanOtp);

        if (optToken.isEmpty()) {
            result.put("success", false);
            result.put("message", "Invalid verification code. Please check and try again.");
            return result;
        }

        OtpToken token = optToken.get();
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            result.put("success", false);
            result.put("message", "Verification code has expired. Please request a new code.");
            return result;
        }

        token.setIsVerified(true);
        otpTokenRepository.save(token);

        result.put("success", true);
        result.put("message", "OTP verified successfully. Please choose your password.");
        return result;
    }

    @Transactional
    public Map<String, Object> registerUser(String name, String email, String otpCode, String password) {
        Map<String, Object> result = new HashMap<>();

        if (name == null || name.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "Full Name is required.");
            return result;
        }

        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            result.put("success", false);
            result.put("message", "Valid email address is required.");
            return result;
        }

        String cleanEmail = email.trim().toLowerCase();

        // 1. Check duplicate email
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            result.put("success", false);
            result.put("message", "Email address already registered. Please sign in.");
            return result;
        }

        // 2. Validate Password Rules (At least 8 chars, 1 uppercase, 1 digit, 1 special char)
        if (password == null || !PASSWORD_PATTERN.matcher(password).matches()) {
            result.put("success", false);
            result.put("message", "Password must be at least 8 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.");
            return result;
        }

        // 3. Verify OTP was confirmed
        Optional<OtpToken> optToken = otpTokenRepository.findTopByEmailIgnoreCaseAndIsVerifiedTrueOrderByCreatedAtDesc(cleanEmail);
        if (optToken.isEmpty()) {
            result.put("success", false);
            result.put("message", "Please verify your email with the OTP code first.");
            return result;
        }

        // 4. Save User to DB
        User user = User.builder()
                .name(name.trim())
                .email(cleanEmail)
                .password(passwordEncoder.encode(password))
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.save(user);

        result.put("success", true);
        result.put("message", "Account registered successfully! Please sign in to continue.");
        return result;
    }

    public Map<String, Object> login(String email, String password) {
        Map<String, Object> result = new HashMap<>();

        if (email == null || email.trim().isEmpty() || password == null || password.isEmpty()) {
            result.put("success", false);
            result.put("message", "Email and password are required.");
            return result;
        }

        String cleanEmail = email.trim().toLowerCase();
        Optional<User> optUser = userRepository.findByEmailIgnoreCase(cleanEmail);

        if (optUser.isEmpty()) {
            result.put("success", false);
            result.put("message", "Invalid email or password.");
            return result;
        }

        User user = optUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            result.put("success", false);
            result.put("message", "Invalid email or password.");
            return result;
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getName(), user.getRole().name());

        Map<String, Object> userDto = new HashMap<>();
        userDto.put("id", user.getId());
        userDto.put("name", user.getName());
        userDto.put("email", user.getEmail());
        userDto.put("role", user.getRole().name());

        result.put("success", true);
        result.put("token", token);
        result.put("user", userDto);
        result.put("message", "Login successful!");
        return result;
    }

    public Optional<User> getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return Optional.empty();
        }
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmailIgnoreCase(email);
    }
}
