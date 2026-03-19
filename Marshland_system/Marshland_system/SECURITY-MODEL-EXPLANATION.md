# Marshland System - Security Model Explanation

## 🔐 Overview

The Marshland System implements a comprehensive security architecture based on **JWT (JSON Web Token) authentication** and **Role-Based Access Control (RBAC)**. This document explains the security model, authentication flow, and authorization mechanisms.

---

## 🛡️ Security Architecture

### **Authentication Layer**
- **JWT Token-based Authentication**
- **BCrypt Password Encryption**
- **Stateless Session Management**
- **Secure Password Validation**

### **Authorization Layer**
- **Role-Based Access Control (RBAC)**
- **Method-Level Security**
- **Endpoint-Level Protection**
- **Fine-Grained Permissions**

---

## 👥 User Roles & Permissions

### **Role Hierarchy**
```
ADMIN (Full Access)
├── ECOLOGIST (Scientific Access)
├── STAFF (Operational Access)
└── TOURIST (Basic Access)
```

### **Role Definitions**

#### 🔴 **ADMIN**
- **Full system access**
- User management (CRUD operations)
- Booking management and approval
- Feedback moderation
- Visit date management
- System configuration

#### 🟢 **ECOLOGIST**
- Species management
- Booking viewing and analysis
- Feedback access for research
- Scientific data access
- Reporting capabilities

#### 🔵 **STAFF**
- Booking approval/rejection
- Visit date management
- Daily operations access
- Customer service functions

#### 🟡 **TOURIST**
- Personal booking management
- Feedback submission
- Species viewing (public)
- Profile management

---

## 🔑 Authentication Flow

### **1. User Registration**
```
POST /api/auth/register
├── Password strength validation
├── Email uniqueness check
├── Role assignment (default: TOURIST)
└── BCrypt password encryption
```

### **2. User Login**
```
POST /api/auth/login
├── Credential validation
├── JWT token generation (24h expiry)
├── Role inclusion in token
└── Authentication response
```

### **3. Token Validation**
```
Each API Request
├── JWT extraction (Bearer token)
├── Token signature verification
├── User authentication
├── Role-based authorization
└── Request processing
```

---

## 🛡️ Security Features

### **Password Security**
- **Minimum 8 characters** with complexity requirements
- **Uppercase, lowercase, digit, special character** required
- **Weak pattern detection** (sequential, repeated, common passwords)
- **BCrypt encryption** with salt

### **JWT Security**
- **HMAC-SHA256 signing**
- **24-hour token expiration**
- **Secure key storage**
- **Role-based claims**

### **HTTP Security Headers**
- **X-Frame-Options: DENY**
- **X-Content-Type-Options: nosniff**
- **Strict-Transport-Security (HSTS)**
- **Cache-Control disabled**

### **CORS Configuration**
- **Configurable origin patterns**
- **Allowed methods: GET, POST, PUT, DELETE, OPTIONS**
- **Exposed headers: Authorization, Content-Type**
- **Credentials support enabled**

---

## 📋 Endpoint Security Matrix

### **Public Endpoints** (No Authentication Required)
```
GET  /api/species/*           - Species information
POST /api/auth/register       - User registration
POST /api/auth/login          - User login
GET  /api/auth/roles          - Available roles
GET  /api/auth/password-requirements - Password rules
```

### **Authenticated Endpoints** (Any Logged-in User)
```
GET  /api/users/profile       - User profile
PUT  /api/users/profile       - Update profile
GET  /api/booking/my-bookings - My bookings
POST /api/booking/new         - Create booking
DELETE /api/booking/{id}/cancel - Cancel booking
POST /api/feedback/{bookingId} - Submit feedback
```

### **Role-Protected Endpoints**

#### **ADMIN Only**
```
GET/PUT/DELETE /api/users/*   - User management
DELETE /api/feedback/{id}      - Delete feedback
DELETE /api/visit-dates/{id}  - Delete visit dates
```

#### **ADMIN + ECOLOGIST**
```
GET /api/booking/all          - All bookings
GET /api/feedback/*           - All feedback
GET /api/booking/daily        - Daily bookings
```

#### **ADMIN + STAFF**
```
POST /api/booking/{id}/approve - Approve booking
POST /api/booking/{id}/reject  - Reject booking
POST /api/visit-dates          - Create visit date
PUT /api/visit-dates/{id}      - Update visit date
```

---

## 🔧 Security Configuration

### **Spring Security Setup**
```java
@EnableWebSecurity
@EnableMethodSecurity
@Configuration
public class SecurityConfig {
    // JWT Authentication Filter
    // CORS Configuration
    // Security Headers
    // Role-Based Endpoints
}
```

### **JWT Implementation**
```java
@Component
public class JwtUtils {
    // Token generation
    // Token validation
    // User extraction
    // Role claims
}
```

### **Password Validation**
```java
public class PasswordValidator {
    // Strength requirements
    // Pattern detection
    // Complexity validation
    // Security rules
}
```

---

## 🚨 Security Best Practices

### **Implemented**
- ✅ **Stateless authentication** with JWT
- ✅ **Password encryption** with BCrypt
- ✅ **Role-based access control**
- ✅ **Method-level security**
- ✅ **Security headers**
- ✅ **CORS configuration**
- ✅ **Input validation**
- ✅ **Password strength requirements**

### **Security Considerations**
- 🔒 **JWT secret key** should be environment-specific
- 🔒 **Database connections** use SSL in production
- 🔒 **API rate limiting** recommended for production
- 🔒 **Token refresh mechanism** for better UX
- 🔒 **Account lockout** for failed login attempts
- 🔒 **Audit logging** for security events

---

## 📊 Security Metrics

### **Authentication**
- **Token Expiry**: 24 hours
- **Password Complexity**: 8+ chars, 4 character types
- **Encryption**: BCrypt (strength adjustable)
- **Session Management**: Stateless

### **Authorization**
- **Roles**: 4 distinct roles
- **Permissions**: 20+ endpoint protections
- **Method Security**: @PreAuthorize annotations
- **Access Control**: Hierarchical role system

### **Network Security**
- **HTTPS**: Recommended for production
- **CORS**: Configurable origins
- **Headers**: Security headers enabled
- **CSRF**: Disabled (stateless JWT)

---

## 🔮 Future Enhancements

### **Future Security Features**
- **Token refresh mechanism**
- **Account lockout policies**
- **Multi-factor authentication**
- **OAuth2 integration**
- **API rate limiting**
- **Audit logging system**
- **Security monitoring dashboard**

---

## 📞 Security Contact

For security-related questions or concerns:
- **Development Team**: Available via project repository
- **Security Issues**: Report through private channels
- **Documentation**: Updated with each security enhancement

---

**Security Model Version**: 1.0  
**Last Updated**: Phase 7 - Authentication & Security  
**Status**: Complete and Production Ready

🔐 *Security is an ongoing process, not a destination.*
