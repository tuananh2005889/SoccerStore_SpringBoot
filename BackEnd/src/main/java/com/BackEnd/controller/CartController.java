package com.BackEnd.controller;

import com.BackEnd.dto.*;
import com.BackEnd.model.Cart;
import com.BackEnd.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/app/cart")
@Slf4j
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * GET /app/cart?userName={userName}
     * Tạo hoặc lấy cart active cho user.
     */
    @GetMapping
    public ResponseEntity<CartBasicInfoDTO> getOrCreateActiveCart(
            @RequestParam String userName) {
        try {
            CartBasicInfoDTO dto = cartService.getOrCreateActiveCartDTO(userName);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException ex) {
            log.warn("User '{}' not found when getting/creating cart", userName, ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception ex) {
            log.error("Unexpected error in getOrCreateActiveCart", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /app/cart/items?cartId={cartId}
     * Lấy danh sách item trong cart.
     */
    @GetMapping("/items")
    public ResponseEntity<List<CartItemDTO>> getAllCartItems(
            @RequestParam Long cartId) {
        try {
            List<CartItemDTO> items = cartService.getCartItemsInActiveCart(cartId);
            return ResponseEntity.ok(items);
        } catch (RuntimeException ex) {
            log.warn("Cart {} not found when fetching items", cartId, ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST /app/cart/add
     * Thêm item vào cart.
     */
    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addItemToCart(
            @RequestBody AddToCartRequest request) {
        try {
            CartItemDTO dto = cartService.addItemToCart(request);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid add-to-cart request: {}", request, ex);
            return ResponseEntity.badRequest().build();
        } catch (Exception ex) {
            log.error("Error adding item to cart", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DELETE /app/cart/remove
     * Xóa item khỏi cart (có thể dùng DELETE với body hoặc param).
     */
    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeItem(
            @RequestParam Long cartId,
            @RequestParam Long productId) {
        try {
            cartService.removeItemFromCart(cartId, productId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            log.warn("Failed to remove product {} from cart {}", productId, cartId, ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception ex) {
            log.error("Error removing item from cart", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DELETE /app/cart/clear?cartId={cartId}
     * Xóa toàn bộ items trong cart.
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @RequestParam Long cartId) {
        try {
            cartService.clearCart(cartId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            log.warn("Failed to clear cart {}", cartId, ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception ex) {
            log.error("Error clearing cart", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /app/cart/image-urls?cartId={cartId}
     * Lấy danh sách URL ảnh theo từng cart item.
     */
    @GetMapping("/image-urls")
    public ResponseEntity<List<String>> getImageUrls(
            @RequestParam Long cartId) {
        try {
            List<String> urls = cartService.getImageUrlPerCartItem(cartId);
            if (urls.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.ok(urls);
        } catch (Exception ex) {
            log.error("Error fetching image URLs for cart {}", cartId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /app/cart/checkout?cartId={cartId}
     * Thanh toán cart, chuyển trạng thái sang PAID.
     */
    @PostMapping("/checkout")
    public ResponseEntity<String> checkoutCart(
            @RequestParam Long cartId) {
        try {
            cartService.checkoutCart(cartId);
            return ResponseEntity.ok("Cart successfully checked out and paid.");
        } catch (RuntimeException ex) {
            log.warn("Cart {} not found for checkout", cartId, ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found");
        } catch (Exception ex) {
            log.error("Error during checkout for cart {}", cartId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Checkout failed");
        }
    }

    /**
     * GET /app/cart/status?cartId={cartId}
     * Lấy trạng thái hiện tại của cart.
     */
    @GetMapping("/status")
    public ResponseEntity<Cart> getCartStatus(
            @RequestParam Long cartId) {
        try {
            Cart cart = cartService.getCartStatus(cartId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException ex) {
            log.warn("Cart {} not found when getting status", cartId, ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
