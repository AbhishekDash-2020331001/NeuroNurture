package com.example.jwt_auth.auth;

public class AuthResponse {
    public String token;
    public String refreshToken;

    public AuthResponse(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
    }
}
