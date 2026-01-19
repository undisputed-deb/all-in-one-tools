package com.docprocessor.service.video;

import com.docprocessor.exception.ProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class VideoServiceImpl implements VideoService {

    private static final Logger logger = LoggerFactory.getLogger(VideoServiceImpl.class);
    private static final String TEMP_DIR = System.getProperty("user.dir") + "/temp/";

    public VideoServiceImpl() {
        new File(TEMP_DIR).mkdirs();
    }

    @Override
    public File addTextToVideo(MultipartFile video, String text, String position, int fontSize, String color) {
        try {
            File inputFile = saveTemp(video, "input_", getExtension(video.getOriginalFilename()));
            File outputFile = new File(TEMP_DIR + "text_" + UUID.randomUUID() + ".mp4");

            // Calculate position
            String positionFilter = getTextPosition(position);

            // FFmpeg command to add text
            List<String> command = new ArrayList<>();
            command.add("/opt/homebrew/bin/ffmpeg");
            command.add("-i");
            command.add(inputFile.getAbsolutePath());
            command.add("-vf");
            command.add(String.format("drawtext=text=%s:fontsize=%d:fontcolor=%s:%s",
                    escapeText(text), fontSize, color, positionFilter));
            command.add("-codec:a");
            command.add("copy");
            command.add("-y");
            command.add(outputFile.getAbsolutePath());

            executeFFmpeg(command);
            inputFile.delete();

            logger.info("Text added to video successfully");
            return outputFile;
        } catch (Exception e) {
            throw new ProcessingException("Failed to add text to video: " + e.getMessage(), e);
        }
    }

    @Override
    public File addImageToVideo(MultipartFile video, MultipartFile image, String position) {
        try {
            File videoFile = saveTemp(video, "video_", getExtension(video.getOriginalFilename()));
            File imageFile = saveTemp(image, "overlay_", getExtension(image.getOriginalFilename()));
            File outputFile = new File(TEMP_DIR + "overlay_" + UUID.randomUUID() + ".mp4");

            // Calculate overlay position
            String overlayPosition = getOverlayPosition(position);

            // FFmpeg command to overlay image
            List<String> command = new ArrayList<>();
            command.add("/opt/homebrew/bin/ffmpeg");
            command.add("-i");
            command.add(videoFile.getAbsolutePath());
            command.add("-i");
            command.add(imageFile.getAbsolutePath());
            command.add("-filter_complex");
            command.add(String.format("[1:v]scale=150:-1[ovrl];[0:v][ovrl]overlay=%s", overlayPosition));
            command.add("-codec:a");
            command.add("copy");
            command.add("-y");
            command.add(outputFile.getAbsolutePath());

            executeFFmpeg(command);
            videoFile.delete();
            imageFile.delete();

            logger.info("Image added to video successfully");
            return outputFile;
        } catch (Exception e) {
            throw new ProcessingException("Failed to add image to video: " + e.getMessage(), e);
        }
    }

    @Override
    public File changeVideoSpeed(MultipartFile video, double speed) {
        try {
            if (speed <= 0 || speed > 4) {
                throw new ProcessingException("Speed must be between 0.1 and 4.0");
            }

            File inputFile = saveTemp(video, "input_", getExtension(video.getOriginalFilename()));
            File outputFile = new File(TEMP_DIR + "speed_" + UUID.randomUUID() + ".mp4");

            // Calculate video and audio tempo
            double videoSpeed = 1.0 / speed;
            double audioTempo = speed;

            // FFmpeg command to change speed
            List<String> command = new ArrayList<>();
            command.add("/opt/homebrew/bin/ffmpeg");
            command.add("-i");
            command.add(inputFile.getAbsolutePath());
            command.add("-filter_complex");
            command.add(String.format("[0:v]setpts=%.2f*PTS[v];[0:a]atempo=%.2f[a]", videoSpeed, audioTempo));
            command.add("-map");
            command.add("[v]");
            command.add("-map");
            command.add("[a]");
            command.add("-y");
            command.add(outputFile.getAbsolutePath());

            executeFFmpeg(command);
            inputFile.delete();

            logger.info("Video speed changed successfully");
            return outputFile;
        } catch (Exception e) {
            throw new ProcessingException("Failed to change video speed: " + e.getMessage(), e);
        }
    }

    @Override
    public File mergeVideos(List<MultipartFile> videos) {
        List<File> inputFiles = new ArrayList<>();
        List<File> normalizedFiles = new ArrayList<>();
        File listFile = null;
        try {
            if (videos == null || videos.size() < 2) {
                throw new ProcessingException("At least 2 videos required for merging");
            }

            logger.info("Starting video merge process for {} videos", videos.size());

            // Save and normalize all input videos to same format/fps
            for (int i = 0; i < videos.size(); i++) {
                String originalFilename = videos.get(i).getOriginalFilename();
                logger.info("Processing video {}: {}", i + 1, originalFilename);
                
                File inputFile = saveTemp(videos.get(i), "merge_" + i + "_", getExtension(originalFilename));
                inputFiles.add(inputFile);
                logger.info("Saved input file: {} (size: {} bytes)", inputFile.getName(), inputFile.length());

                // Normalize each video to 30fps, same resolution, h264 codec with pixel format
                File normalizedFile = new File(TEMP_DIR + "normalized_" + i + "_" + UUID.randomUUID() + ".mp4");
                List<String> normalizeCmd = new ArrayList<>();
                normalizeCmd.add("/opt/homebrew/bin/ffmpeg");
                normalizeCmd.add("-i");
                normalizeCmd.add(inputFile.getAbsolutePath());
                // Add silent audio source as second input
                normalizeCmd.add("-f");
                normalizeCmd.add("lavfi");
                normalizeCmd.add("-i");
                normalizeCmd.add("anullsrc=channel_layout=stereo:sample_rate=44100");
                // Video filter with pixel format
                normalizeCmd.add("-vf");
                normalizeCmd.add("fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p");
                // Video codec settings
                normalizeCmd.add("-c:v");
                normalizeCmd.add("libx264");
                normalizeCmd.add("-preset");
                normalizeCmd.add("fast");
                normalizeCmd.add("-crf");
                normalizeCmd.add("23");
                normalizeCmd.add("-pix_fmt");
                normalizeCmd.add("yuv420p");
                // Audio codec settings - use original audio if exists, otherwise use silent audio
                normalizeCmd.add("-c:a");
                normalizeCmd.add("aac");
                normalizeCmd.add("-b:a");
                normalizeCmd.add("128k");
                normalizeCmd.add("-ar");
                normalizeCmd.add("44100");
                normalizeCmd.add("-ac");
                normalizeCmd.add("2");
                // Use shortest stream (video length)
                normalizeCmd.add("-shortest");
                normalizeCmd.add("-y");
                normalizeCmd.add(normalizedFile.getAbsolutePath());
                
                logger.info("Normalizing video {} with command: {}", i + 1, String.join(" ", normalizeCmd));
                executeFFmpeg(normalizeCmd);
                normalizedFiles.add(normalizedFile);
                logger.info("Normalized file created: {} (size: {} bytes)", normalizedFile.getName(), normalizedFile.length());
            }

            // Create file list for FFmpeg concat
            listFile = new File(TEMP_DIR + "filelist_" + UUID.randomUUID() + ".txt");
            logger.info("Creating concat file list: {}", listFile.getAbsolutePath());
            try (PrintWriter writer = new PrintWriter(listFile)) {
                for (File f : normalizedFiles) {
                    String line = "file '" + f.getAbsolutePath() + "'";
                    writer.println(line);
                    logger.info("Added to concat list: {}", line);
                }
            }

            File outputFile = new File(TEMP_DIR + "merged_" + UUID.randomUUID() + ".mp4");
            logger.info("Output file will be: {}", outputFile.getAbsolutePath());

            // FFmpeg command to concat normalized videos
            List<String> command = new ArrayList<>();
            command.add("/opt/homebrew/bin/ffmpeg");
            command.add("-f");
            command.add("concat");
            command.add("-safe");
            command.add("0");
            command.add("-i");
            command.add(listFile.getAbsolutePath());
            command.add("-c");
            command.add("copy");
            command.add("-y");
            command.add(outputFile.getAbsolutePath());

            logger.info("Executing concat command: {}", String.join(" ", command));
            executeFFmpeg(command);
            logger.info("Merge completed. Output file size: {} bytes", outputFile.length());

            // Cleanup
            for (File f : inputFiles) {
                f.delete();
            }
            for (File f : normalizedFiles) {
                f.delete();
            }
            if (listFile != null) {
                listFile.delete();
            }

            logger.info("Videos merged successfully: {}", outputFile.getName());
            return outputFile;
        } catch (Exception e) {
            logger.error("Failed to merge videos", e);
            // Cleanup on error
            for (File f : inputFiles) {
                if (f.exists()) f.delete();
            }
            for (File f : normalizedFiles) {
                if (f.exists()) f.delete();
            }
            if (listFile != null && listFile.exists()) {
                listFile.delete();
            }
            throw new ProcessingException("Failed to merge videos: " + e.getMessage(), e);
        }
    }

    private void executeFFmpeg(List<String> command) throws Exception {
        logger.info("Executing FFmpeg: {}", String.join(" ", command));

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        // Read output
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        boolean completed = process.waitFor(120, TimeUnit.SECONDS);
        if (!completed) {
            process.destroyForcibly();
            throw new ProcessingException("FFmpeg process timed out");
        }

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            logger.error("FFmpeg error output: {}", output.toString());
            throw new ProcessingException("FFmpeg failed: " + output.toString().substring(0, Math.min(200, output.length())));
        }
    }

    private File saveTemp(MultipartFile file, String prefix, String extension) throws IOException {
        File tempFile = new File(TEMP_DIR + prefix + UUID.randomUUID() + extension);
        file.transferTo(tempFile);
        return tempFile;
    }

    private String getExtension(String filename) {
        if (filename == null) return ".mp4";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot) : ".mp4";
    }

    private String escapeText(String text) {
        // For FFmpeg drawtext filter, escape special chars and wrap in single quotes
        String escaped = text.replace("\\", "\\\\")
                            .replace("'", "'\\''")
                            .replace(":", "\\:");
        return "'" + escaped + "'";
    }

    private String getTextPosition(String position) {
        return switch (position.toLowerCase()) {
            case "top-left" -> "x=10:y=10";
            case "top-right" -> "x=w-tw-10:y=10";
            case "bottom-left" -> "x=10:y=h-th-10";
            case "bottom-right" -> "x=w-tw-10:y=h-th-10";
            case "center" -> "x=(w-tw)/2:y=(h-th)/2";
            default -> "x=10:y=h-th-10"; // default bottom-left
        };
    }

    private String getOverlayPosition(String position) {
        return switch (position.toLowerCase()) {
            case "top-left" -> "10:10";
            case "top-right" -> "main_w-overlay_w-10:10";
            case "bottom-left" -> "10:main_h-overlay_h-10";
            case "bottom-right" -> "main_w-overlay_w-10:main_h-overlay_h-10";
            case "center" -> "(main_w-overlay_w)/2:(main_h-overlay_h)/2";
            default -> "10:10"; // default top-left
        };
    }
}
