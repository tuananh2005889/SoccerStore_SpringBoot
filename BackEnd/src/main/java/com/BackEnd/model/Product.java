package com.BackEnd.model;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "product")
@Getter
@Setter
public class Product {
    public Product(String name, String brand, String category, Double price,
            int quantity, String description, int yearOfManufacture,
            String size, String material, double weight) {
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
        this.description = description;

        this.yearOfManufacture = yearOfManufacture;
        this.size = size;
        this.material = material;

    }

    public Product() {
    }

    @Id
    @Column(name = "product_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(nullable = false, length = 255)

    private String name;
    private String brand;
    private String category;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String description;
    private Integer yearOfManufacture;
    private String size;
    private String material;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore // Bỏ qua serialize trường này
    private List<Review> reviews = new ArrayList<>();
}
