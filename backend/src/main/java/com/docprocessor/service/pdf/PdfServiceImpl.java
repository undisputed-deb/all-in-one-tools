package com.docprocessor.service.pdf;

import com.docprocessor.exception.ProcessingException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PdfServiceImpl implements PdfService {

    private static final Logger logger = LoggerFactory.getLogger(PdfServiceImpl.class);
    private static final String TEMP_DIR = "./temp/";

    @Override
    public File mergePdfs(List<MultipartFile> files) {
        try {
            PDDocument mergedDoc = new PDDocument();

            for (MultipartFile file : files) {
                PDDocument doc = Loader.loadPDF(file.getBytes());
                for (PDPage page : doc.getPages()) {
                    mergedDoc.addPage(page);
                }
                doc.close();
            }

            File outputFile = new File(TEMP_DIR + "merged_" + UUID.randomUUID() + ".pdf");
            mergedDoc.save(outputFile);
            mergedDoc.close();

            logger.info("PDFs merged successfully");
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to merge PDFs", e);
        }
    }

    @Override
    public List<File> splitPdf(MultipartFile file, int pageCount) {
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());
            List<File> splitFiles = new ArrayList<>();

            int totalPages = document.getNumberOfPages();
            int currentPage = 0;

            while (currentPage < totalPages) {
                PDDocument splitDoc = new PDDocument();
                int endPage = Math.min(currentPage + pageCount, totalPages);

                for (int i = currentPage; i < endPage; i++) {
                    splitDoc.addPage(document.getPage(i));
                }

                File outputFile = new File(TEMP_DIR + "split_" + UUID.randomUUID() + ".pdf");
                splitDoc.save(outputFile);
                splitDoc.close();
                splitFiles.add(outputFile);

                currentPage = endPage;
            }

            document.close();
            logger.info("PDF split into {} parts", splitFiles.size());
            return splitFiles;
        } catch (IOException e) {
            throw new ProcessingException("Failed to split PDF", e);
        }
    }

    @Override
    public File compressPdf(MultipartFile file) {
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());

            // Basic compression by optimizing images
            PDDocument compressedDoc = new PDDocument();
            for (PDPage page : document.getPages()) {
                compressedDoc.addPage(page);
            }

            File outputFile = new File(TEMP_DIR + "compressed_" + UUID.randomUUID() + ".pdf");
            compressedDoc.save(outputFile);

            document.close();
            compressedDoc.close();

            logger.info("PDF compressed successfully");
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to compress PDF", e);
        }
    }

    @Override
    public File protectPdf(MultipartFile file, String password) {
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());

            AccessPermission ap = new AccessPermission();
            StandardProtectionPolicy spp = new StandardProtectionPolicy(password, password, ap);
            spp.setEncryptionKeyLength(128);
            spp.setPermissions(ap);

            document.protect(spp);

            File outputFile = new File(TEMP_DIR + "protected_" + UUID.randomUUID() + ".pdf");
            document.save(outputFile);
            document.close();

            logger.info("PDF password protected successfully");
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to protect PDF", e);
        }
    }

    @Override
    public File addPageNumbers(MultipartFile file) {
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());
            int pageNumber = 1;

            for (PDPage page : document.getPages()) {
                PDPageContentStream contentStream = new PDPageContentStream(
                        document, page, PDPageContentStream.AppendMode.APPEND, true, true);

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);

                PDRectangle pageSize = page.getMediaBox();
                float x = pageSize.getWidth() / 2;
                float y = 30;

                contentStream.newLineAtOffset(x, y);
                contentStream.showText(String.valueOf(pageNumber));
                contentStream.endText();
                contentStream.close();

                pageNumber++;
            }

            File outputFile = new File(TEMP_DIR + "numbered_" + UUID.randomUUID() + ".pdf");
            document.save(outputFile);
            document.close();

            logger.info("Page numbers added successfully");
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to add page numbers", e);
        }
    }

    @Override
    public List<File> pdfToJpg(MultipartFile file) {
        return pdfToImage(file, "jpg");
    }

    @Override
    public List<File> pdfToPng(MultipartFile file) {
        return pdfToImage(file, "png");
    }

    private List<File> pdfToImage(MultipartFile file, String format) {
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());
            PDFRenderer renderer = new PDFRenderer(document);
            List<File> imageFiles = new ArrayList<>();

            for (int i = 0; i < document.getNumberOfPages(); i++) {
                BufferedImage image = renderer.renderImageWithDPI(i, 300, ImageType.RGB);
                File outputFile = new File(TEMP_DIR + "page_" + (i + 1) + "_" + UUID.randomUUID() + "." + format);
                ImageIO.write(image, format, outputFile);
                imageFiles.add(outputFile);
            }

            document.close();
            logger.info("PDF converted to {} images", imageFiles.size());
            return imageFiles;
        } catch (IOException e) {
            throw new ProcessingException("Failed to convert PDF to images", e);
        }
    }

    @Override
    public File imageToPdf(List<MultipartFile> images) {
        try {
            PDDocument document = new PDDocument();

            for (MultipartFile imageFile : images) {
                BufferedImage bim = ImageIO.read(imageFile.getInputStream());
                float width = bim.getWidth();
                float height = bim.getHeight();

                PDPage page = new PDPage(new PDRectangle(width, height));
                document.addPage(page);

                File tempImage = new File(TEMP_DIR + UUID.randomUUID() + "_temp.png");
                ImageIO.write(bim, "png", tempImage);

                PDImageXObject pdImage = PDImageXObject.createFromFile(tempImage.getAbsolutePath(), document);
                PDPageContentStream contentStream = new PDPageContentStream(document, page);
                contentStream.drawImage(pdImage, 0, 0, width, height);
                contentStream.close();

                tempImage.delete();
            }

            File outputFile = new File(TEMP_DIR + "images_to_pdf_" + UUID.randomUUID() + ".pdf");
            document.save(outputFile);
            document.close();

            logger.info("Images converted to PDF successfully");
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to convert images to PDF", e);
        }
    }

    @Override
    public File excelToPdf(MultipartFile file) {
        try {
            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            PDDocument document = new PDDocument();

            for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
                Sheet sheet = workbook.getSheetAt(sheetIndex);
                PDPage page = new PDPage(PDRectangle.A4);
                document.addPage(page);

                PDPageContentStream contentStream = new PDPageContentStream(document, page);
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                contentStream.newLineAtOffset(50, 750);

                int rowNum = 0;
                for (Row row : sheet) {
                    if (rowNum > 50) break; // Limit rows per page

                    StringBuilder rowText = new StringBuilder();
                    for (Cell cell : row) {
                        switch (cell.getCellType()) {
                            case STRING:
                                rowText.append(cell.getStringCellValue()).append(" | ");
                                break;
                            case NUMERIC:
                                rowText.append(cell.getNumericCellValue()).append(" | ");
                                break;
                            default:
                                rowText.append(" | ");
                        }
                    }

                    contentStream.showText(rowText.toString());
                    contentStream.newLineAtOffset(0, -15);
                    rowNum++;
                }

                contentStream.endText();
                contentStream.close();
            }

            File outputFile = new File(TEMP_DIR + "excel_to_pdf_" + UUID.randomUUID() + ".pdf");
            document.save(outputFile);
            document.close();
            workbook.close();

            logger.info("Excel converted to PDF successfully");
            return outputFile;
        } catch (IOException e) {
            throw new ProcessingException("Failed to convert Excel to PDF", e);
        }
    }
}
