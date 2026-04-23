package com.rugezi.marshland.validator;

import java.util.regex.Pattern;

public class PasswordValidator {
    
    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");
    
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        
        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getMessage() {
            return message;
        }
    }
    
    public static ValidationResult validatePassword(String password) {
        if (password == null) {
            return new ValidationResult(false, "Password cannot be null");
        }
        
        if (password.length() < MIN_LENGTH) {
            return new ValidationResult(false, 
                String.format("Password must be at least %d characters long", MIN_LENGTH));
        }
        
        if (password.length() > MAX_LENGTH) {
            return new ValidationResult(false, 
                String.format("Password must not exceed %d characters", MAX_LENGTH));
        }
        
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            return new ValidationResult(false, 
                "Password must contain at least one uppercase letter");
        }
        
        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            return new ValidationResult(false, 
                "Password must contain at least one lowercase letter");
        }
        
        if (!DIGIT_PATTERN.matcher(password).find()) {
            return new ValidationResult(false, 
                "Password must contain at least one digit");
        }
        
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            return new ValidationResult(false, 
                "Password must contain at least one special character (!@#$%^&*()_+-=[]{};':\"\\|,.<>/?)");
        }
        
        // Check for common weak patterns
        if (containsWeakPatterns(password)) {
            return new ValidationResult(false, 
                "Password contains common weak patterns. Please choose a stronger password.");
        }
        
        return new ValidationResult(true, "Password meets all security requirements");
    }
    
    private static boolean containsWeakPatterns(String password) {
        String lowerPassword = password.toLowerCase();
        
        // Check for sequential characters
        if (containsSequentialChars(lowerPassword)) {
            return true;
        }
        
        // Check for repeated characters
        if (containsRepeatedChars(password)) {
            return true;
        }
        
        // Check for common passwords
        String[] commonPasswords = {
            "password", "12345678", "qwerty123", "admin123", 
            "letmein", "welcome", "monkey123", "dragon123"
        };
        
        for (String common : commonPasswords) {
            if (lowerPassword.contains(common)) {
                return true;
            }
        }
        
        return false;
    }
    
    private static boolean containsSequentialChars(String password) {
        for (int i = 0; i < password.length() - 2; i++) {
            char c1 = password.charAt(i);
            char c2 = password.charAt(i + 1);
            char c3 = password.charAt(i + 2);
            
            if (c2 == c1 + 1 && c3 == c2 + 1) {
                return true;
            }
        }
        return false;
    }
    
    private static boolean containsRepeatedChars(String password) {
        for (int i = 0; i < password.length() - 2; i++) {
            char c = password.charAt(i);
            if (password.charAt(i + 1) == c && password.charAt(i + 2) == c) {
                return true;
            }
        }
        return false;
    }
    
    public static String getPasswordRequirements() {
        return "Password requirements:\n" +
               "- At least " + MIN_LENGTH + " characters long\n" +
               "- Maximum " + MAX_LENGTH + " characters\n" +
               "- At least one uppercase letter\n" +
               "- At least one lowercase letter\n" +
               "- At least one digit\n" +
               "- At least one special character (!@#$%^&*()_+-=[]{};':\"\\|,.<>/?)\n" +
               "- No common weak patterns or sequential characters";
    }
}
