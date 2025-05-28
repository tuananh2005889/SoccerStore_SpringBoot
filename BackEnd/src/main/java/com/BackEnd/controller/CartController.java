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

    @PutMapping("/update")
    public ResponseEntity<CartItemDTO> updateItemQuantity(
            @RequestBody UpdateCartItemRequest request) {
        try {
            CartItemDTO dto = cartService.updateItemQuantity(request.getCartId(), request.getProductId(),
                    request.getQuantity());
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid update quantity request: {}", request, ex);
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException ex) {
            log.warn("Failed to update quantity for product {} in cart {}", request.getProductId(), request.getCartId(),
                    ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception ex) {
            log.error("Error updating item quantity", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
