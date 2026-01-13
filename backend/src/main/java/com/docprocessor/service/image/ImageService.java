package com.docprocessor.service.image;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;

public interface ImageService {
    File resizeImage(MultipartFile file, int width, int height);
    File cropImage(MultipartFile file, int x, int y, int width, int height);
    File rotateImage(MultipartFile file, double angle);
    File convertFormat(MultipartFile file, String targetFormat);
    File compressImage(MultipartFile file, float quality);
}
