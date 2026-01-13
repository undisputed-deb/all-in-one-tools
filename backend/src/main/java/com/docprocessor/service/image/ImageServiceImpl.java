package com.docprocessor.service.image;

import com.docprocessor.exception.ProcessingException;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.geometry.Positions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class ImageServiceImpl implements ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageServiceImpl.class);
    private static final String TEMP_DIR = "./temp/";

    @Override
    public File resizeImage(MultipartFile file, int width, int height) {
        try {
            File outputFile = new File(TEMP_DIR + "resized_" + UUID.randomUUID() + getExtension(file));

            Thumbnails.of(file.getInputStream())
                    .size(width, height)
                    .toFile(outputFile);

            logger.info("Image resized to {}x{}", width, height);
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to resize image", e);
        }
    }

    @Override
    public File cropImage(MultipartFile file, int x, int y, int width, int height) {
        try {
            File outputFile = new File(TEMP_DIR + "cropped_" + UUID.randomUUID() + getExtension(file));

            BufferedImage originalImage = ImageIO.read(file.getInputStream());

            Thumbnails.of(originalImage)
                    .sourceRegion(x, y, width, height)
                    .size(width, height)
                    .toFile(outputFile);

            logger.info("Image cropped successfully");
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to crop image", e);
        }
    }

    @Override
    public File rotateImage(MultipartFile file, double angle) {
        try {
            File outputFile = new File(TEMP_DIR + "rotated_" + UUID.randomUUID() + getExtension(file));

            Thumbnails.of(file.getInputStream())
                    .scale(1.0)
                    .rotate(angle)
                    .toFile(outputFile);

            logger.info("Image rotated by {} degrees", angle);
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to rotate image", e);
        }
    }

    @Override
    public File convertFormat(MultipartFile file, String targetFormat) {
        try {
            String extension = "." + targetFormat.toLowerCase();
            File outputFile = new File(TEMP_DIR + "converted_" + UUID.randomUUID() + extension);

            BufferedImage image = ImageIO.read(file.getInputStream());
            ImageIO.write(image, targetFormat, outputFile);

            logger.info("Image converted to {}", targetFormat);
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to convert image format", e);
        }
    }

    @Override
    public File compressImage(MultipartFile file, float quality) {
        try {
            File outputFile = new File(TEMP_DIR + "compressed_" + UUID.randomUUID() + getExtension(file));

            Thumbnails.of(file.getInputStream())
                    .scale(1.0)
                    .outputQuality(quality)
                    .toFile(outputFile);

            logger.info("Image compressed with quality {}", quality);
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to compress image", e);
        }
    }

    private String getExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return ".jpg";
    }
}
