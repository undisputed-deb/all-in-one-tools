package com.docprocessor.controller;

import com.docprocessor.service.video.VideoService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/video")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping("/add-text")
    public ResponseEntity<Map<String, Object>> addTextToVideo(
            @RequestParam("video") MultipartFile video,
            @RequestParam("text") String text,
            @RequestParam(value = "position", defaultValue = "bottom-left") String position,
            @RequestParam(value = "fontSize", defaultValue = "24") int fontSize,
            @RequestParam(value = "color", defaultValue = "white") String color) {

        File result = videoService.addTextToVideo(video, text, position, fontSize, color);
        return buildResponse(result, "Text added to video successfully");
    }

    @PostMapping("/add-image")
    public ResponseEntity<Map<String, Object>> addImageToVideo(
            @RequestParam("video") MultipartFile video,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "position", defaultValue = "top-left") String position) {

        File result = videoService.addImageToVideo(video, image, position);
        return buildResponse(result, "Image added to video successfully");
    }

    @PostMapping("/change-speed")
    public ResponseEntity<Map<String, Object>> changeVideoSpeed(
            @RequestParam("video") MultipartFile video,
            @RequestParam("speed") double speed) {

        File result = videoService.changeVideoSpeed(video, speed);
        return buildResponse(result, "Video speed changed successfully");
    }

    @PostMapping("/merge")
    public ResponseEntity<Map<String, Object>> mergeVideos(
            @RequestParam("videos") List<MultipartFile> videos) {

        File result = videoService.mergeVideos(videos);
        return buildResponse(result, "Videos merged successfully");
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadVideo(@PathVariable String filename) {
        File file = new File("./temp/" + filename);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp4"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(File file, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("filename", file.getName());
        response.put("downloadUrl", "/api/video/download/" + file.getName());
        response.put("fileSize", file.length());
        response.put("message", message);
        return ResponseEntity.ok(response);
    }
}
