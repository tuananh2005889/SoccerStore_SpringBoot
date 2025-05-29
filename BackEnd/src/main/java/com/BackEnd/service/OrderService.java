package com.BackEnd.service;

import com.BackEnd.dto.*;
import com.BackEnd.model.*;
import com.BackEnd.repository.*;
import com.BackEnd.utils.DTOConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final CartService cartService;
    private final UserService userService;
    private final PaymentService paymentService;
    private final OrderRepository orderRepo;
    private final OrderDetailRepository orderDetailRepo;
    private final CartRepository cartRepository;

    public CreateOrderResponse createOrder(Long cartId) throws Exception {
        // 1. Đánh dấu giỏ hàng đã SUBMITTED
        cartService.changeCartStatus(cartId, Cart.CartStatus.SUBMITTED);
        var cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart không tồn tại: " + cartId));

        // 2. Lấy user và tổng tiền
        User user = cartService.getUserByCartId(cartId);
        double amount = cartService.getCartTotalAmount(cartId);
        if (amount <= 0) {
            throw new IllegalArgumentException("Giỏ rỗng hoặc tổng tiền <= 0");
        }

        // 3. Sinh orderCode & tạo QR Base64
        Long orderCode = System.currentTimeMillis() + new Random().nextInt(9999);
        PaymentRequest payReq = new PaymentRequest(orderCode, (int) amount, "AutoParts Checkout");
        String qrBase64 = paymentService.createOrderInPayOS(payReq);

        // 4. Lưu Order vào DB
        Order order = new Order();
        order.setCart(cart);
        order.setUser(user);
        order.setOrderCode(orderCode);
        order.setQrCodeToCheckout(qrBase64);
        order.setTotalPrice(amount);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
        orderRepo.save(order);

        // 5. Trả về DTO chứa mã và QR
        return new CreateOrderResponse(orderCode, qrBase64, amount);
    }

    public Boolean checkIfUserHasPendingOrder(String userName) {
        User user = userService.getUserByName(userName);
        return orderRepo.existsByUserAndStatus(user, Order.OrderStatus.PENDING);
    }

    public Long getPendingOrderId(String userName) {
        User user = userService.getUserByName(userName);
        Order order = orderRepo.findTopByUserAndStatusOrderByCreatedAtDesc(user, Order.OrderStatus.PENDING);
        return order.getOrderId();
    }

    @Transactional
    public List<OrderDetailDTO> getOrderDetailListInPendingOrder(String userName) {
        User user = userService.getUserByName(userName);
        List<Order> orderList = orderRepo.findByUserAndStatus(user, Order.OrderStatus.PENDING);
        List<OrderDetail> orderDetailList = new ArrayList<>();
        orderList.stream().findFirst().ifPresent(order -> {
            orderDetailList.addAll(order.getOrderDetails());
        });
        return orderDetailList.stream()
                .map(DTOConverter::toOrderDetailDTO)
                .collect(Collectors.toList());
    }

    public void changeOrderStatus(Long orderCode, Order.OrderStatus status) {
        try {
            Order order = orderRepo.findByOrderCode(orderCode);
            if (order != null) {
                order.setStatus(status);
                orderRepo.save(order);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Transactional
    public List<OrderDTO> getOrdersByStatus(Order.OrderStatus status) {
        List<Order> orders = orderRepo.findByStatus(status);
        return orders.stream().map(
                order -> DTOConverter.toOrderDTO(order)).collect(Collectors.toList());
    }

    @Transactional
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepo.findAll();
        return orders.stream().map(order -> DTOConverter.toOrderDTO(order)).collect(Collectors.toList());
    }

    @Transactional
    public List<OrderDTO> getAllOrdersOfUserByStatusAndName(String userName, Order.OrderStatus status) {
        User user = userService.getUserByName(userName);
        List<Order> orderList = orderRepo.findByUserAndStatus(user, status);
        return orderList.stream().map(order -> {
            return DTOConverter.toOrderDTO(order);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void processSuccessfulPayment(Long orderCode) {
        try {
            Order order = orderRepo.findByOrderCode(orderCode);
            if (order == null) {
                throw new RuntimeException("Order not found with orderCode: " + orderCode);
            }

            // Chỉ cập nhật nếu đơn hàng đang ở trạng thái PENDING
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.PAID);
                order.setCreatedAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
                orderRepo.save(order);

                // Cập nhật trạng thái giỏ hàng
                Cart cart = order.getCart();
                if (cart != null) {
                    cart.setStatus(Cart.CartStatus.COMPLETED);
                    cartRepository.save(cart);
                }

                System.out.println("Order " + orderCode + " has been successfully processed as PAID");
            } else {
                System.out.println("Order " + orderCode + " is already processed with status: " + order.getStatus());
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error processing payment for order: " + orderCode, e);
        }
    }

    // Phương thức để lấy thông tin đơn hàng theo orderCode
    @Transactional(readOnly = true)
    public OrderDTO getOrderByOrderCode(Long orderCode) {
        Order order = orderRepo.findByOrderCode(orderCode);
        if (order == null) {
            throw new RuntimeException("Order not found with orderCode: " + orderCode);
        }
        return DTOConverter.toOrderDTO(order);
    }

    // Phương thức để kiểm tra xem đơn hàng có thể thanh toán không
    public boolean canOrderBePaid(Long orderCode) {
        Order order = orderRepo.findByOrderCode(orderCode);
        return order != null && order.getStatus() == Order.OrderStatus.PENDING;
    }
}