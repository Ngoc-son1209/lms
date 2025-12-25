package com.lms.dev.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.lms.dev.entity.Payment;
import com.lms.dev.repository.PaymentRepository;
import com.lms.dev.service.PaymentService;
import com.lms.dev.service.VNPayService;
import com.lms.dev.service.VNPaySignatureService;

import java.util.*;

@RestController
@RequestMapping("/api/vnpay")
@CrossOrigin(origins = "*")
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;
    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private VNPaySignatureService vnPaySignatureService;

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/create-payment")
    public String createPayment(@RequestParam UUID userId, @RequestParam UUID courseId, @RequestParam Double amount)
            throws Exception {
        // # NOTE: Giữ lại endpoint cũ để tương thích FE hiện tại.
        // Về sau nên migrate sang endpoint mới chỉ cần courseId và lấy userId từ JWT.

        String vnpTxnRef = String.valueOf(System.currentTimeMillis());
        String orderInfo = "Thanh toan khoa hoc " + courseId + " - " + vnpTxnRef;

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setCourseId(courseId);
        payment.setAmount(amount);
        payment.setStatus("PENDING");
        payment.setOrderInfo(orderInfo);
        payment.setVnpTxnRef(vnpTxnRef);
        paymentRepo.save(payment);

        return vnPayService.createPaymentUrl(vnpTxnRef, amount, orderInfo);
    }

    @RequestMapping(value = "/ipn", method = { RequestMethod.GET, RequestMethod.POST })
    public String handleIpn(@RequestParam Map<String, String> params) {
        // # NOTE: Verify chữ ký để tránh giả mạo callback
        boolean valid = vnPaySignatureService.verify(params);
        if (!valid) {
            return "INVALID_SIGNATURE";
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        paymentRepo.findByVnpTxnRef(txnRef).ifPresent(p -> {
            if ("00".equals(responseCode)) {
                p.setStatus("PAID");
                paymentRepo.save(p);
                // # NOTE: Thanh toán thành công -> enroll + auto assign class
                paymentService.fulfillPaidPayment(p);
            } else {
                p.setStatus("FAILED");
                paymentRepo.save(p);
            }
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
