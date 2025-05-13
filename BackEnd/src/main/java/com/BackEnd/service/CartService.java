package com.BackEnd.service;

import com.BackEnd.dto.AddToCartRequest;
import com.BackEnd.dto.CartBasicInfoDTO;
import com.BackEnd.dto.CartItemDTO;
import com.BackEnd.model.Cart;
import com.BackEnd.model.CartItem;
import com.BackEnd.model.Product;
import com.BackEnd.model.User;
import com.BackEnd.repository.CartItemRepository;
import com.BackEnd.repository.CartRepository;
import com.BackEnd.repository.ProductRepository;
import com.BackEnd.repository.UserRepository;
import com.BackEnd.utils.DTOConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    /**
     * Tạo hoặc lấy cart ACTIVE cho user
     */
    public CartBasicInfoDTO getOrCreateActiveCartDTO(String userName) {
        User user = userRepo.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("User not found: " + userName));
        Cart cart = cartRepo.findCartByUserAndStatus(user, Cart.CartStatus.ACTIVE)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setStatus(Cart.CartStatus.ACTIVE);
                    return cartRepo.save(newCart);
                });
        return DTOConverter.toCartBasicInfoDTO(cart);
    }

    /**
     * Lấy danh sách CartItemDTO trong cart
     */
    public List<CartItemDTO> getCartItemsInActiveCart(Long cartId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        return cart.getCartItems().stream()
                .map(DTOConverter::toCartItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * Thêm hoặc tăng số lượng item trong cart
     */
    public CartItemDTO addItemToCart(AddToCartRequest req) {
        if (req.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        Cart cart = cartRepo.findById(req.getCartId())
                .orElseThrow(() -> new RuntimeException("Cart not found: " + req.getCartId()));
        Product product = productRepo.findByProductId(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + req.getProductId()));

        CartItem item = cart.getCartItems().stream()
                .filter(ci -> ci.getProduct().getProductId().equals(req.getProductId()))
                .findFirst()
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + req.getQuantity());
                    return cartItemRepo.save(existing);
                })
                .orElseGet(() -> {
                    CartItem newItem = new CartItem(product, req.getQuantity(), cart);
                    CartItem saved = cartItemRepo.save(newItem);
                    cart.getCartItems().add(saved);
                    return saved;
                });

        cartRepo.save(cart);
        return DTOConverter.toCartItemDTO(item);
    }

    /**
     * Xóa 1 item khỏi cart
     */
    public void removeItemFromCart(Long cartId, Long productId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        CartItem item = cart.getCartItems().stream()
                .filter(ci -> ci.getProduct().getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found for product: " + productId));
        cartItemRepo.delete(item);
        cart.getCartItems().remove(item);
    }

    /**
     * Xóa hết items trong cart
     */
    public void clearCart(Long cartId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        cartItemRepo.deleteAll(cart.getCartItems());
        cart.getCartItems().clear();
        cartRepo.save(cart);
    }

    /**
     * Thanh toán cart: chuyển sang trạng thái PAID
     */
    public void checkoutCart(Long cartId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        cart.setStatus(Cart.CartStatus.PAID);
        cartRepo.save(cart);
    }

    /**
     * Lấy thông tin trạng thái của cart
     */
    public Cart getCartStatus(Long cartId) {
        return cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
    }

    /**
     * Lấy danh sách URL ảnh theo CartItems
     */
    public List<String> getImageUrlPerCartItem(Long cartId) {
        List<String> urls = cartRepo.findImageUrlPerCartItem(cartId);
        return urls != null ? urls : Collections.emptyList();
    }
}
