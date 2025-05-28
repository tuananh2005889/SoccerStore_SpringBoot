package com.BackEnd.repository;

import com.BackEnd.model.Cart;
import com.BackEnd.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findCartByUserAndStatus(User user, Cart.CartStatus status);

    @Query(value = "SELECT pi.image_url " +
            "FROM product_images pi " +
            "JOIN cart_item ci ON ci.product_id = pi.product_id " +
            "WHERE ci.cart_id = :cartId " +
            "AND pi.id = (SELECT MIN(id) FROM product_images WHERE product_id = pi.product_id)", nativeQuery = true)
    List<String> findImageUrlPerCartItem(@Param("cartId") Long cartId);
}