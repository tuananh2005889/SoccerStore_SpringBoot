package com.BackEnd.dto;

import lombok.Data;

@Data
public class WebhookData {
    private String status;
    private Long orderCode;
    private Integer amount;
    private String description;

}