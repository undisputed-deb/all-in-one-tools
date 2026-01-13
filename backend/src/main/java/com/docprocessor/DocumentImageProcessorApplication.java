package com.docprocessor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DocumentImageProcessorApplication {

    public static void main(String[] args) {
        SpringApplication.run(DocumentImageProcessorApplication.class, args);
    }
}
