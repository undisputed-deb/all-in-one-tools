package com.docprocessor.storage;

import com.docprocessor.exception.InvalidFileException;
import com.docprocessor.exception.StorageException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path rootLocation;
    private final Path tempLocation;

    @Value("${storage.max.file.size}")
    private long maxFileSize;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private static final List<String> ALLOWED_PDF_TYPES = Arrays.asList(
            "application/pdf"
    );

    private static final List<String> ALLOWED_EXCEL_TYPES = Arrays.asList(
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    public LocalStorageService(@Value("${storage.location}") String storageLocation,
                                @Value("${storage.temp.location}") String tempStorageLocation) {
        this.rootLocation = Paths.get(storageLocation);
        this.tempLocation = Paths.get(tempStorageLocation);
    }

    @PostConstruct
    @Override
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(tempLocation);
            logger.info("Storage directories initialized successfully");
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage directories", e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        return storeFile(file, rootLocation);
    }

    @Override
    public String storeTemp(MultipartFile file) {
        return storeFile(file, tempLocation);
    }

    private String storeFile(MultipartFile file, Path location) {
        if (file.isEmpty()) {
            throw new InvalidFileException("Cannot store empty file");
        }

        if (file.getSize() > maxFileSize) {
            throw new InvalidFileException("File size exceeds maximum allowed size of 50MB");
        }

        validateFileType(file);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + fileExtension;

        try {
            if (originalFilename.contains("..")) {
                throw new InvalidFileException("Filename contains invalid path sequence: " + originalFilename);
            }

            try (InputStream inputStream = file.getInputStream()) {
                Path destinationFile = location.resolve(newFilename).normalize().toAbsolutePath();

                if (!destinationFile.getParent().equals(location.toAbsolutePath())) {
                    throw new InvalidFileException("Cannot store file outside designated directory");
                }

                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
                logger.info("File stored successfully: {}", newFilename);
                return newFilename;
            }
        } catch (IOException e) {
            throw new StorageException("Failed to store file: " + newFilename, e);
        }
    }

    private void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new InvalidFileException("File type could not be determined");
        }

        if (!ALLOWED_IMAGE_TYPES.contains(contentType) &&
            !ALLOWED_PDF_TYPES.contains(contentType) &&
            !ALLOWED_EXCEL_TYPES.contains(contentType)) {
            throw new InvalidFileException("File type not allowed: " + contentType);
        }
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return (lastDot == -1) ? "" : filename.substring(lastDot);
    }

    @Override
    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new StorageException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new StorageException("Could not read file: " + filename, e);
        }
    }

    @Override
    public void delete(String filename) {
        try {
            Path file = load(filename);
            Files.deleteIfExists(file);
            logger.info("File deleted: {}", filename);
        } catch (IOException e) {
            logger.error("Failed to delete file: {}", filename, e);
        }
    }

    @Override
    public void deleteAll() {
        try {
            Files.walk(rootLocation)
                    .filter(Files::isRegularFile)
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            logger.error("Failed to delete file: {}", path, e);
                        }
                    });
        } catch (IOException e) {
            throw new StorageException("Failed to delete files", e);
        }
    }

    @Override
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void scheduleTempFileCleanup() {
        try {
            long currentTime = Instant.now().toEpochMilli();
            long oneHourAgo = currentTime - 3600000;

            Files.walk(tempLocation)
                    .filter(Files::isRegularFile)
                    .filter(path -> {
                        try {
                            return Files.getLastModifiedTime(path).toMillis() < oneHourAgo;
                        } catch (IOException e) {
                            return false;
                        }
                    })
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                            logger.info("Deleted old temp file: {}", path.getFileName());
                        } catch (IOException e) {
                            logger.error("Failed to delete temp file: {}", path, e);
                        }
                    });
        } catch (IOException e) {
            logger.error("Failed to cleanup temp files", e);
        }
    }
}
