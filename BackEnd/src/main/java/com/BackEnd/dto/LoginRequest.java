package com.BackEnd.dto;

public record LoginRequest(
        String token,
        Long userId,
        String userName) {
}