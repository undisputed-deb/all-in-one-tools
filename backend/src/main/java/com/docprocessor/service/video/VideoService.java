package com.docprocessor.service.video;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.util.List;

public interface VideoService {

    /**
     * Add text overlay to video
     */
    File addTextToVideo(MultipartFile video, String text, String position, int fontSize, String color);

    /**
     * Add image overlay to video
     */
    File addImageToVideo(MultipartFile video, MultipartFile image, String position);

    /**
     * Change video speed
     */
    File changeVideoSpeed(MultipartFile video, double speed);

    /**
     * Merge multiple videos into one
     */
    File mergeVideos(List<MultipartFile> videos);
}
