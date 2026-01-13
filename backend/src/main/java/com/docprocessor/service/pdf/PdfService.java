package com.docprocessor.service.pdf;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

public interface PdfService {
    File mergePdfs(List<MultipartFile> files);
    List<File> splitPdf(MultipartFile file, int pageCount);
    File compressPdf(MultipartFile file);
    File protectPdf(MultipartFile file, String password);
    File addPageNumbers(MultipartFile file);
    List<File> pdfToJpg(MultipartFile file);
    List<File> pdfToPng(MultipartFile file);
    File imageToPdf(List<MultipartFile> images);
    File excelToPdf(MultipartFile file);
}
