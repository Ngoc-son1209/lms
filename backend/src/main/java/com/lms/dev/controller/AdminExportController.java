package com.lms.dev.controller;

import com.lms.dev.entity.Course;
import com.lms.dev.entity.Instructor;
import com.lms.dev.entity.Payment;
import com.lms.dev.entity.User;
import com.lms.dev.enums.UserRole;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.InstructorRepository;
import com.lms.dev.repository.PaymentRepository;
import com.lms.dev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/export")
@RequiredArgsConstructor
public class AdminExportController {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/payments.xlsx")
    public ResponseEntity<byte[]> exportPayments() throws IOException {
        List<Payment> list = paymentRepository.findAll();

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            XSSFSheet sheet = wb.createSheet("Payments");
            int rowIdx = 0;
            String[] cols = { "PaymentID", "UserEmail", "CourseName", "Amount", "Status", "vnpTxnRef", "OrderInfo" };

            Row header = sheet.createRow(rowIdx++);
            for (int i = 0; i < cols.length; i++) {
                header.createCell(i).setCellValue(cols[i]);
            }

            for (Payment p : list) {
                User u = p.getUserId() != null ? userRepository.findById(p.getUserId()).orElse(null) : null;
                Course c = p.getCourseId() != null ? courseRepository.findById(p.getCourseId()).orElse(null) : null;

                Row row = sheet.createRow(rowIdx++);
                int col = 0;
                row.createCell(col++).setCellValue(p.getId() != null ? p.getId().toString() : "");
                row.createCell(col++).setCellValue(u != null ? u.getEmail() : "");
                row.createCell(col++).setCellValue(c != null ? c.getCourse_name() : "");
                row.createCell(col++).setCellValue(p.getAmount() != null ? p.getAmount() : 0.0);
                row.createCell(col++).setCellValue(p.getStatus() != null ? p.getStatus() : "");
                row.createCell(col++).setCellValue(p.getVnpTxnRef() != null ? p.getVnpTxnRef() : "");
                row.createCell(col).setCellValue(p.getOrderInfo() != null ? p.getOrderInfo() : "");
            }

            for (int i = 0; i < cols.length; i++)
                sheet.autoSizeColumn(i);

            wb.write(bos);
            return buildExcelResponse(bos.toByteArray(), "payments.xlsx");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/instructors.xlsx")
    public ResponseEntity<byte[]> exportInstructors() throws IOException {
        List<Instructor> list = instructorRepository.findAll();

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            XSSFSheet sheet = wb.createSheet("Instructors");
            int rowIdx = 0;
            String[] cols = { "InstructorID", "UserID", "FullName", "Email", "Mobile", "Gender", "Expertise",
                    "EmailVerified", "Status", "CreatedAt" };

            Row header = sheet.createRow(rowIdx++);
            for (int i = 0; i < cols.length; i++) {
                header.createCell(i).setCellValue(cols[i]);
            }

            for (Instructor ins : list) {
                User u = userRepository.findByEmail(ins.getEmail());

                Row row = sheet.createRow(rowIdx++);
                int col = 0;
                row.createCell(col++).setCellValue(ins.getId() != null ? ins.getId().toString() : "");
                row.createCell(col++).setCellValue(u != null ? u.getId().toString() : "");
                row.createCell(col++).setCellValue(ins.getFullName() != null ? ins.getFullName() : "");
                row.createCell(col++).setCellValue(ins.getEmail() != null ? ins.getEmail() : "");
                row.createCell(col++).setCellValue(u != null && u.getMobileNumber() != null ? u.getMobileNumber() : "");
                row.createCell(col++).setCellValue(u != null && u.getGender() != null ? u.getGender() : "");
                row.createCell(col++).setCellValue(ins.getExpertise() != null ? ins.getExpertise() : "");
                row.createCell(col++).setCellValue(u != null && u.isEnabled());
                row.createCell(col++).setCellValue(ins.getStatus() != null ? ins.getStatus().name() : "");
                row.createCell(col).setCellValue(ins.getCreatedAt() != null ? ins.getCreatedAt().toString() : "");
            }

            for (int i = 0; i < cols.length; i++)
                sheet.autoSizeColumn(i);

            wb.write(bos);
            return buildExcelResponse(bos.toByteArray(), "instructors.xlsx");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/students.xlsx")
    public ResponseEntity<byte[]> exportStudents() throws IOException {
        List<User> students = userRepository.findByRole(UserRole.USER);

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            XSSFSheet sheet = wb.createSheet("Students");
            int rowIdx = 0;
            String[] cols = { "UserID", "FullName", "Email", "Mobile", "Gender", "Dob", "Location", "Profession",
                    "CreatedAt" };

            Row header = sheet.createRow(rowIdx++);
            for (int i = 0; i < cols.length; i++) {
                header.createCell(i).setCellValue(cols[i]);
            }

            for (User u : students) {
                Row row = sheet.createRow(rowIdx++);
                int col = 0;
                row.createCell(col++).setCellValue(u.getId() != null ? u.getId().toString() : "");
                row.createCell(col++).setCellValue(u.getUsername() != null ? u.getUsername() : "");
                row.createCell(col++).setCellValue(u.getEmail() != null ? u.getEmail() : "");
                row.createCell(col++).setCellValue(u.getMobileNumber() != null ? u.getMobileNumber() : "");
                row.createCell(col++).setCellValue(u.getGender() != null ? u.getGender() : "");
                row.createCell(col++).setCellValue(u.getDob() != null ? u.getDob() : "");
                row.createCell(col++).setCellValue(u.getLocation() != null ? u.getLocation() : "");
                row.createCell(col++).setCellValue(u.getProfession() != null ? u.getProfession() : "");
                row.createCell(col).setCellValue(u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
            }

            for (int i = 0; i < cols.length; i++)
                sheet.autoSizeColumn(i);

            wb.write(bos);
            return buildExcelResponse(bos.toByteArray(), "students.xlsx");
        }
    }

    private ResponseEntity<byte[]> buildExcelResponse(byte[] bytes, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
        headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
