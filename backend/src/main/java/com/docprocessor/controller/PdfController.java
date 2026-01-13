package com.docprocessor.controller;

import com.docprocessor.config.RateLimitConfig;
import com.docprocessor.dto.ProcessingResponse;
import com.docprocessor.exception.RateLimitExceededException;
import com.docprocessor.service.pdf.PdfService;
import io.github.bucket4j.Bucket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    @Autowired
    private PdfService pdfService;

    @Autowired
    private RateLimitConfig rateLimitConfig;

    @Autowired
    private Map<String, Bucket> rateLimitBuckets;

    private void checkRateLimit(String username) {
        Bucket bucket = rateLimitBuckets.computeIfAbsent(username, k -> rateLimitConfig.createNewBucket());
        if (!bucket.tryConsume(1)) {
            throw new RateLimitExceededException("Rate limit exceeded. Please try again later.");
        }
    }

    @PostMapping("/merge")
    public ResponseEntity<ProcessingResponse> mergePdfs(
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = pdfService.mergePdfs(files);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/pdf/download/" + result.getName())
                .fileSize(result.length())
                .message("PDFs merged successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/split")
    public ResponseEntity<List<ProcessingResponse>> splitPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("pageCount") int pageCount,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        List<File> results = pdfService.splitPdf(file, pageCount);
        List<ProcessingResponse> responses = new ArrayList<>();

        for (File result : results) {
            responses.add(ProcessingResponse.builder()
                    .filename(result.getName())
                    .downloadUrl("/api/pdf/download/" + result.getName())
                    .fileSize(result.length())
                    .build());
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/compress")
    public ResponseEntity<ProcessingResponse> compressPdf(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = pdfService.compressPdf(file);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/pdf/download/" + result.getName())
                .fileSize(result.length())
                .message("PDF compressed successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/protect")
    public ResponseEntity<ProcessingResponse> protectPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("password") String password,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = pdfService.protectPdf(file, password);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/pdf/download/" + result.getName())
                .fileSize(result.length())
                .message("PDF password protected successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-page-numbers")
    public ResponseEntity<ProcessingResponse> addPageNumbers(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = pdfService.addPageNumbers(file);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/pdf/download/" + result.getName())
                .fileSize(result.length())
                .message("Page numbers added successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/to-jpg")
    public ResponseEntity<List<ProcessingResponse>> pdfToJpg(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        List<File> results = pdfService.pdfToJpg(file);
        List<ProcessingResponse> responses = new ArrayList<>();

        for (File result : results) {
            responses.add(ProcessingResponse.builder()
                    .filename(result.getName())
                    .downloadUrl("/api/pdf/download/" + result.getName())
                    .fileSize(result.length())
                    .build());
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/to-png")
    public ResponseEntity<List<ProcessingResponse>> pdfToPng(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        List<File> results = pdfService.pdfToPng(file);
        List<ProcessingResponse> responses = new ArrayList<>();

        for (File result : results) {
            responses.add(ProcessingResponse.builder()
                    .filename(result.getName())
                    .downloadUrl("/api/pdf/download/" + result.getName())
                    .fileSize(result.length())
                    .build());
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/from-images")
    public ResponseEntity<ProcessingResponse> imagesToPdf(
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = pdfService.imageToPdf(files);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/pdf/download/" + result.getName())
                .fileSize(result.length())
                .message("Images converted to PDF successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/from-excel")
    public ResponseEntity<ProcessingResponse> excelToPdf(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = pdfService.excelToPdf(file);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/pdf/download/" + result.getName())
                .fileSize(result.length())
                .message("Excel converted to PDF successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        File file = new File("./temp/" + filename);
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
