package com.docprocessor.controller;

import com.docprocessor.config.RateLimitConfig;
import com.docprocessor.dto.ProcessingResponse;
import com.docprocessor.exception.RateLimitExceededException;
import com.docprocessor.service.image.ImageService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/image")
public class ImageController {

    @Autowired
    private ImageService imageService;

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

    @PostMapping("/resize")
    public ResponseEntity<ProcessingResponse> resizeImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("width") int width,
            @RequestParam("height") int height,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = imageService.resizeImage(file, width, height);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/image/download/" + result.getName())
                .fileSize(result.length())
                .message("Image resized successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/crop")
    public ResponseEntity<ProcessingResponse> cropImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("x") int x,
            @RequestParam("y") int y,
            @RequestParam("width") int width,
            @RequestParam("height") int height,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = imageService.cropImage(file, x, y, width, height);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/image/download/" + result.getName())
                .fileSize(result.length())
                .message("Image cropped successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/rotate")
    public ResponseEntity<ProcessingResponse> rotateImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("angle") double angle,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = imageService.rotateImage(file, angle);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/image/download/" + result.getName())
                .fileSize(result.length())
                .message("Image rotated successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/convert")
    public ResponseEntity<ProcessingResponse> convertFormat(
            @RequestParam("file") MultipartFile file,
            @RequestParam("format") String format,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = imageService.convertFormat(file, format);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/image/download/" + result.getName())
                .fileSize(result.length())
                .message("Image format converted successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/compress")
    public ResponseEntity<ProcessingResponse> compressImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "quality", defaultValue = "0.8") float quality,
            Authentication authentication) {

        checkRateLimit(authentication.getName());

        File result = imageService.compressImage(file, quality);
        ProcessingResponse response = ProcessingResponse.builder()
                .filename(result.getName())
                .downloadUrl("/api/image/download/" + result.getName())
                .fileSize(result.length())
                .message("Image compressed successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        File file = new File("./temp/" + filename);
        Resource resource = new FileSystemResource(file);

        String contentType = MediaType.IMAGE_JPEG_VALUE;
        if (filename.endsWith(".png")) {
            contentType = MediaType.IMAGE_PNG_VALUE;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
