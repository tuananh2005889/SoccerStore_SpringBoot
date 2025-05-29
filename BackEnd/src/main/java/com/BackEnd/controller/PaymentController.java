package com.BackEnd.controller;

import com.BackEnd.dto.PaymentRequest;
import com.BackEnd.service.OrderService;
import com.BackEnd.service.PaymentService;
import com.BackEnd.utils.SignatureUtil;
import com.BackEnd.model.Order;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;
import vn.payos.type.PaymentData;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/app/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    @Value("${PAYOS_API_KEY}")
    private String apiKey;
    @Value("${PAYOS_CLIENT_ID}")
    private String clientId;
    @Value("${PAYOS_CHECKSUM_KEY}")
    private String checksumKey;

    private PayOS payOS;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        payOS = new PayOS(clientId, apiKey, checksumKey);
    }

    @GetMapping("/status")
    public PaymentStatus getPayosPaymentStatus(@RequestParam Long orderCode) {
        try {
            if (orderCode == null) {
                System.err.println("OrderCode is null in status check");
                throw new IllegalArgumentException("OrderCode is required");
            }
            PaymentLinkData paymentData = payOS.getPaymentLinkInformation(orderCode);
            String status = paymentData.getStatus();
            System.out.println("Payment status for orderCode " + orderCode + ": " + status);
            return PaymentStatus.valueOf(status);
        } catch (Exception e) {
            System.err.println("Error checking payment status for orderCode " + orderCode + ": " + e.getMessage());
            throw new RuntimeException("Failed to check payment status: " + e.getMessage());
        }
    }

    @PutMapping("/cancel")
    public PaymentLinkData cancelPayment(@RequestParam Long orderId) throws Exception {
        String cancelReason = "User cancelled";
        System.out.println("Cancelling payment for orderId: " + orderId);
        return payOS.cancelPaymentLink(orderId, cancelReason);
    }

    // Bỏ phần webhook vì không sử dụng

    enum PaymentStatus {
        PENDING,
        PAID,
        CANCELLED,
    }
}