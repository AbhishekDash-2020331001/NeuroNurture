package com.example.jwt_auth.auth;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.jwt_auth.JwtUtil;
import com.example.jwt_auth.user.UserRepository;


@RestController
@RequestMapping("/auth/oauth2")
public class OAuth2Controller {
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final UserRepository userRepository;

    public OAuth2Controller(JwtUtil jwtUtil, AuthService authService, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.authService = authService;
        this.userRepository = userRepository;
    }

    // Removed the @GetMapping("/success") endpoint to avoid conflict with the custom OAuth2 success handler.

}
