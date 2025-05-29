package com.BackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BasicCartInfoDto {
    private Long cartId;
    private String status;
    private Double totalPrice;
}