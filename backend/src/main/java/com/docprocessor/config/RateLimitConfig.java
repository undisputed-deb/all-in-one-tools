package com.docprocessor.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Configuration
 *
 * Purpose: Prevents abuse and ensures fair resource usage
 *
 * Why Rate Limiting is Important:
 * 1. Prevents DoS attacks by limiting requests per user
 * 2. Protects CPU-intensive operations (PDF/image processing)
 * 3. Ensures fair access for all users
 * 4. Reduces server load and prevents resource exhaustion
 *
 * Implementation: Token bucket algorithm
 * - Each user gets a bucket with tokens
 * - Each request consumes one token
 * - Tokens refill over time
 * - Requests blocked when bucket is empty
 */
@Configuration
public class RateLimitConfig {

    @Value("${rate.limit.capacity}")
    private int capacity;

    @Value("${rate.limit.refill.tokens}")
    private int refillTokens;

    @Value("${rate.limit.refill.duration}")
    private int refillDuration;

    @Bean
    public Map<String, Bucket> rateLimitBuckets() {
        return new ConcurrentHashMap<>();
    }

    public Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(capacity,
                Refill.intervally(refillTokens, Duration.ofSeconds(refillDuration)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
