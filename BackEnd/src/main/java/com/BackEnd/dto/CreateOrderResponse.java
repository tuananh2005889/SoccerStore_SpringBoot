package com.BackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

@AllArgsConstructor
public class CreateOrderResponse {
    private Long orderCode;
    private Double amount;
    private String qrCode;

    public CreateOrderResponse() {
    }

    // Tự viết constructor 3 tham số:
    public CreateOrderResponse(Long orderCode, String qrCode, Double amount) {
        this.orderCode = orderCode;
        this.qrCode = qrCode;
        this.amount = amount;
    }
}