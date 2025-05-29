package com.BackEnd.service;

import com.BackEnd.dto.PaymentRequest;
import com.BackEnd.utils.SignatureUtil;
import com.BackEnd.dto.CreateOrderResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentData;
import vn.payos.type.ItemData;
import vn.payos.type.Webhook;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PaymentService {
    private final PayOS payOS;

    public PaymentService(
            @Value("${PAYOS_CLIENT_ID}") String clientId,
            @Value("${PAYOS_API_KEY}") String apiKey,
            @Value("${PAYOS_CHECKSUM_KEY}") String checksumKey) {
        this.payOS = new PayOS(clientId, apiKey, checksumKey);
    }

    public String createOrderInPayOS(PaymentRequest paymentRequest) throws Exception {
        // 1. Validate
        if (paymentRequest.getOrderCode() == null || paymentRequest.getAmount() == null) {
            throw new IllegalArgumentException("OrderCode và Amount không được null");
        }
        if (paymentRequest.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount phải > 0");
        }

        // 2. Chuẩn bị danh sách items
        ItemData item = ItemData.builder()
                .name("AutoParts Order #" + paymentRequest.getOrderCode())
                .price(paymentRequest.getAmount())
                .quantity(1)
                .build();
        PaymentData paymentData = PaymentData.builder()
                .orderCode(paymentRequest.getOrderCode())
                .amount(paymentRequest.getAmount())
                .description(paymentRequest.getDescription())
                .items(Collections.singletonList(item))
                .cancelUrl("http://localhost:3000/cancel")
                .returnUrl("http://localhost:3000/success")
                .build();

        // 3. Tạo link trên PayOS
        CheckoutResponseData response = payOS.createPaymentLink(paymentData);

        // 4. Lấy chuỗi Base64 của QR
        String qrBase64 = response.getQrCode(); // hoặc getQrCodeImage() tùy SDK
        if (qrBase64 == null) {
            throw new RuntimeException("Không nhận được QR code từ PayOS");
        }

        return qrBase64;
    }

}