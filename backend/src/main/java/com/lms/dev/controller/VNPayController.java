package com.lms.dev.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.lms.dev.entity.Payment;
import com.lms.dev.repository.PaymentRepository;
import com.lms.dev.service.VNPayService;

import java.util.*;

@RestController
@RequestMapping("/api/vnpay")
@CrossOrigin(origins = "*")
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;
    @Autowired
    private PaymentRepository paymentRepo;

    @GetMapping("/create-payment")
    public String createPayment(@RequestParam UUID userId, @RequestParam Double amount) throws Exception {
        
        String vnpTxnRef = String.valueOf(System.currentTimeMillis());
        String orderInfo = "Thanh toan don hang " + vnpTxnRef;

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setStatus("PENDING");
        payment.setOrderInfo(orderInfo);
        payment.setVnpTxnRef(vnpTxnRef);
        paymentRepo.save(payment);

        return vnPayService.createPaymentUrl(vnpTxnRef, amount, orderInfo);
    }

    @PostMapping("/ipn")
    public String handleIpn(@RequestParam Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        paymentRepo.findByVnpTxnRef(txnRef).ifPresent(p -> {
            if ("00".equals(responseCode)) {
                p.setStatus("PAID");
            } else {
                p.setStatus("FAILED");
            }
            paymentRepo.save(p);
        });
        return "OK";
    }

    @GetMapping("/payments")
    public List<Payment> getPayments() {
        return paymentRepo.findAll();
    }

    @GetMapping("/return")
    public String paymentReturn(@RequestParam Map<String, String> params) {
        // xử lý trả về từ VNPay
        return "Payment return received";
    }

}

