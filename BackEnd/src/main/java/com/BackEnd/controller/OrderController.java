package com.BackEnd.controller;

import com.BackEnd.dto.CreateOrderResponse;
import com.BackEnd.dto.OrderDTO;
import com.BackEnd.dto.OrderDetailDTO;
import com.BackEnd.model.Order;
import com.BackEnd.service.OrderService;
import com.BackEnd.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/app/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody Map<String, Long> request) {
        try {
            Long cartId = request.get("cartId");
            if (cartId == null) {
                System.err.println("CartId không tồn tại trong yêu cầu tạo đơn hàng");
                return ResponseEntity.badRequest().build();
            }

            // Tạo đơn hàng và nhận response
            CreateOrderResponse response = orderService.createOrder(cartId);
            if (response == null || response.getOrderCode() == null) {
                System.err.println("Không thể tạo đơn hàng cho cartId: " + cartId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }

            System.out.println("Đơn hàng được tạo thành công - OrderCode: " + response.getOrderCode() +
                    ", QR Code URL: " + response.getQrCode() + ", Tổng tiền: " + response.getAmount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo đơn hàng: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/check-pending")
    public ResponseEntity<Boolean> checkIfUserHasPendingOrder(@RequestParam String userName) {
        boolean result = orderService.checkIfUserHasPendingOrder(userName);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/pending-order-detail-list")
    public ResponseEntity<List<OrderDetailDTO>> getOrderDetailListInPendingOrder(@RequestParam String userName) {
        try {
            List<OrderDetailDTO> result = orderService.getOrderDetailListInPendingOrder(userName);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/change-order-status")
    public ResponseEntity<Void> changeOrderStatus(
            @RequestParam Long orderCode,
            @RequestParam Order.OrderStatus status) {
        orderService.changeOrderStatus(orderCode, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/get-orders-by-status")
    public List<OrderDTO> getOrder(@RequestParam Order.OrderStatus status) {
        return orderService.getOrdersByStatus(status);
    }

    @GetMapping("/get-all-orders")
    public List<OrderDTO> getAllOrder() {
        return orderService.getAllOrders();
    }

    @GetMapping("/get-pending-order-of-user")
    public List<OrderDTO> getPendingOrderOfUser(@RequestParam String userName) throws Exception {
        return orderService.getAllOrdersOfUserByStatusAndName(userName, Order.OrderStatus.PENDING);
    }

    @GetMapping("/get-all-paid-orders-of-user")
    public List<OrderDTO> getAllPaidOrdersOfUser(@RequestParam String userName) throws Exception {
        return orderService.getAllOrdersOfUserByStatusAndName(userName, Order.OrderStatus.PAID);
    }

    @GetMapping("/get-all-submitted-orders-of-user")
    public List<OrderDTO> getAllSubmittedOrdersOfUser(@RequestParam String userName) throws Exception {
        return orderService.getAllOrdersOfUserByStatusAndName(userName, Order.OrderStatus.SUBMITTED);
    }

    @GetMapping("/get-all-shipped-orders-of-user")
    public List<OrderDTO> getAllShippedOrdersOfUser(@RequestParam String userName) throws Exception {
        return orderService.getAllOrdersOfUserByStatusAndName(userName, Order.OrderStatus.SHIPPED);
    }

    @GetMapping("/get-all-delivered-orders-of-user")
    public List<OrderDTO> getAllDeliveredOrdersOfUser(@RequestParam String userName) throws Exception {
        return orderService.getAllOrdersOfUserByStatusAndName(userName, Order.OrderStatus.DELIVERED);
    }
}