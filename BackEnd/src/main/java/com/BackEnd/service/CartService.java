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

import jakarta.transaction.Transactional;
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

    public CartBasicInfoDTO getOrCreateActiveCartDTO(String userName) {
        User user = userRepo.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Not found user: " + userName));
        Cart cart = cartRepo.findCartByUserAndStatus(user, Cart.CartStatus.ACTIVE)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setStatus(Cart.CartStatus.ACTIVE);
                    return cartRepo.save(newCart);
                });
        return DTOConverter.toCartBasicInfoDTO(cart);
    }

    public CartItemDTO addItemToCart(AddToCartRequest req) {
        if (req.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        Cart cart = cartRepo.findById(req.getCartId())
                .orElseThrow(() -> new RuntimeException("Cart not found: " + req.getCartId()));
        Product product = productRepo.findByProductId(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Prodcut not found: " + req.getProductId()));

        CartItem item = cartItemRepo.findByCartIdAndProductId(req.getCartId(), req.getProductId())
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

    @Transactional
    public void removeItemFromCart(Long cartId, Long productId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found" + cartId));
        CartItem item = cartItemRepo.findByCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new RuntimeException("No products found in cart: " + productId));
        cart.getCartItems().remove(item);
        cartItemRepo.delete(item);
        cartRepo.save(cart);
    }

    @Transactional
    public void removeAllItemsByProductId(Long productId) {
        cartItemRepo.deleteByProductId(productId);
    }

    @Transactional
    public void clearCart(Long cartId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        cartItemRepo.deleteAll(cart.getCartItems());
        cart.getCartItems().clear();
        cartRepo.save(cart);
    }

    @Transactional
    public void checkoutCart(Long cartId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        cart.setStatus(Cart.CartStatus.PAID);
        cartRepo.save(cart);
    }

    public Cart getCartStatus(Long cartId) {
        return cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
    }

    public List<String> getImageUrlPerCartItem(Long cartId) {
        List<String> urls = cartRepo.findImageUrlPerCartItem(cartId);
        return urls != null ? urls : Collections.emptyList();
    }

    public List<CartItemDTO> getCartItemsInActiveCart(Long cartId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));

        return cart.getCartItems().stream()
                .map(ci -> {
                    Product p = ci.getProduct();
                    String img = p.getImages().isEmpty() ? "" : p.getImages().get(0);
                    return new CartItemDTO(
                            ci.getCartItemId(),
                            p.getProductId(),
                            p.getName(),
                            p.getPrice(),
                            img,
                            p.getBrand(),
                            p.getDescription(),
                            ci.getQuantity());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemDTO updateItemQuantity(Long cartId, Long productId, int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be greater than 1");
        }

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));

        CartItem cartItem = cartItemRepo.findByCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new RuntimeException("No product fount in cart: " + productId));

        cartItem.setQuantity(quantity);
        cartItemRepo.save(cartItem);

        return convertToCartItemDTO(cartItem);
    }

    private CartItemDTO convertToCartItemDTO(CartItem cartItem) {
        Product p = cartItem.getProduct();
        String img = p.getImages().isEmpty() ? "" : p.getImages().get(0);
        return new CartItemDTO(
                cartItem.getCartItemId(),
                p.getProductId(),
                p.getName(),
                p.getPrice(),
                img,
                p.getBrand(),
                p.getDescription(),
                cartItem.getQuantity());
    }
}