// src/main/java/com/BackEnd/dto/CartItemDTO.java
package com.BackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartItemDTO {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private Double price;
    private String imageUrl;
    private String brand;
    private String description;
    private Integer quantity;
}
