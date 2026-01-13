package com.docprocessor.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Custom User Details Service
 * Purpose: Provides user authentication data
 * Note: In production, this would query a database. For demo purposes, using in-memory users.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final Map<String, String> users = new HashMap<>();
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public CustomUserDetailsService() {
        // Demo users - in production, these would be in a database
        users.put("admin", passwordEncoder.encode("admin123"));
        users.put("user", passwordEncoder.encode("user123"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String password = users.get(username);
        if (password == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        return new User(username, password, new ArrayList<>());
    }

    public boolean authenticateUser(String username, String password) {
        String storedPassword = users.get(username);
        if (storedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(password, storedPassword);
    }

    public boolean registerUser(String username, String password) {
        if (users.containsKey(username)) {
            return false; // User already exists
        }
        users.put(username, passwordEncoder.encode(password));
        return true;
    }

    public boolean userExists(String username) {
        return users.containsKey(username);
    }
}
