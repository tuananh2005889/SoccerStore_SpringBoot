package com.BackEnd.service;

import com.BackEnd.dto.*;
import com.BackEnd.model.*;
import com.BackEnd.repository.*;
import com.BackEnd.repository.OrderDetailRepository;
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

    public CreateOrderResponse createOrder(Long cartId) {
        cartService.changeCartStatus(cartId, Cart.CartStatus.SUBMITTED);

        User user = cartService.getUserByCartId(cartId);
        List<CartItem> cartItemList = cartService.getAllCartItemsInActiveCart(cartId);

        List<OrderDetail> orderDetailList = cartItemList.stream()
                .map(cartItem -> {
                    Product product = cartItem.getProduct();
                    if (product == null || product.getPrice() == null) {
                        throw new IllegalArgumentException("CartItem contains invalid product or price");
                    }
                    int quantity = cartItem.getQuantity();
                    double totalPrice = quantity * product.getPrice();
                    return new OrderDetail(null, product, quantity, totalPrice);
                })
                .collect(Collectors.toList());

        double cartTotalPrice = orderDetailList.stream()
                .mapToDouble(OrderDetail::getTotalPrice)
                .sum();

        Long orderCode = 0L;
        String qrCode = null;
        int retry = 0;
        boolean success = false;
        while (!success && retry < 5) {
            try {
                orderCode = System.currentTimeMillis() + new Random().nextInt(9999);
                PaymentRequest paymentRequest = new PaymentRequest(orderCode, (int) cartTotalPrice,
                        "AutoParts Checkout");
                qrCode = paymentService.createOrderInPayOS(paymentRequest);
                success = true;

                Order order = new Order();
                order.setQrCodeToCheckout(qrCode);
                order.setUser(user);
                order.setStatus(Order.OrderStatus.PENDING);
                order.setCreatedAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
                order.setShippingAddress("test");
                order.setOrderCode(orderCode);
                order.setTotalPrice(cartTotalPrice);

                for (OrderDetail od : orderDetailList) {
                    od.setOrder(order);
                }
                order.setOrderDetails(orderDetailList);
                orderRepo.save(order);

            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    retry++;
                    System.out.println("OrderCode is duplicate, please try again");
                } else {
                    throw e;
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        if (!success) {
            throw new RuntimeException("Cannot create order because duplicate orderCode too much");
        }

        return new CreateOrderResponse(qrCode, orderCode);
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
            order.setStatus(status);
            orderRepo.save(order);
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

}