package com.BackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private String name;
    private String brand;
    private String category;
    private double price;
    int quantity;
    String description;
    private Integer yearOfManufacture;
    String size;
    private String material;

}
