package com.example.jwt_auth.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.jwt_auth.JwtUtil;
import com.example.jwt_auth.user.User;
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

    @GetMapping("/success")
    public ResponseEntity<AuthResponse> oauth2Success(OAuth2AuthenticationToken authentication) {
        // Extract email as username
        String email = authentication.getPrincipal().getAttribute("email");
        // Provision user if not exist
        User user = userRepository.findByUsername(email)
            .orElseGet(() -> userRepository.save(new User(null, email, "")));
        // Issue tokens
        String token = jwtUtil.generateToken(user.getUsername());
        String refreshToken = authService.createRefreshToken(user);
        return ResponseEntity.ok(new AuthResponse(token, refreshToken));
    }

}
