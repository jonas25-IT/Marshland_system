# Marshland Tourism System - User Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Test Credentials](#test-credentials)
3. [Access Flow](#access-flow)
4. [Role-Based Dashboards](#role-based-dashboards)
5. [Common Features](#common-features)
6. [Troubleshooting](#troubleshooting)

---

## System Overview

The Marshland Tourism System is a comprehensive web application for managing marshland conservation, tourism, and biodiversity tracking. The system provides role-based access for different user types including Administrators, Tourists, Ecologists, and Staff members.

**System URL:** http://localhost:3000 (Frontend)
**Backend API:** http://localhost:8083/api

---

## Test Credentials

### Administrator Account
- **Email:** admin@rugezi.rw
- **Password:** admin123
- **Role:** ADMIN
- **Access:** Full system control, user management, booking approvals, species management, gallery management

### Tourist Account
- **Email:** tourist@rugezi.rw
- **Password:** tourist123
- **Role:** TOURIST
- **Access:** Browse tours, create bookings, view gallery, view notifications

### Ecologist Account
- **Email:** ecologist@rugezi.rw
- **Password:** ecologist123
- **Role:** ECOLOGIST
- **Access:** Species management, conservation tracking, research data, biodiversity monitoring

### Staff Account
- **Email:** staff@rugezi.rw
- **Password:** staff123
- **Role:** STAFF
- **Access:** Booking management, visitor check-ins, daily operations

---

## Access Flow

### Step 1: Navigate to the Application
1. Open your web browser
2. Go to: `http://localhost:3000`
3. The login page will be displayed

### Step 2: Login
1. Enter your email address (from test credentials above)
2. Enter your password
3. Click the "Login" button
4. You will be redirected to your role-specific dashboard

### Step 3: Dashboard Navigation
Based on your role, you will see one of the following dashboards:
- **Admin Dashboard:** Full system overview and management
- **Tourist Dashboard:** Tours, bookings, and personal information
- **Ecologist Dashboard:** Species data and conservation tracking
- **Staff Dashboard:** Bookings and visitor management

### Step 4: Logout
1. Click on your profile icon in the top right corner
2. Select "Logout" from the dropdown menu
3. You will be redirected to the login page

---

## Role-Based Dashboards

### Administrator Dashboard

**Main Features:**
- **Overview Statistics:** Total users, active bookings, biodiversity count, pending reviews
- **Platform Growth:** Visual chart showing monthly growth trends
- **System Activity Tracking:** Real-time monitoring of user registrations and bookings
- **User Management:** Create, edit, delete users, assign roles
- **Booking Management:** View all bookings, approve/reject requests
- **Species Management:** Add, edit, delete species data, upload images
- **Gallery Management:** Upload and manage gallery photos
- **Notifications:** Send system-wide notifications to users
- **Settings:** Configure system settings
- **Reports:** View analytics and export data

**Navigation Tabs:**
1. **Dashboard:** Main overview with statistics and activity tracking
2. **Users:** User management interface
3. **Bookings:** Booking management and approval workflow
4. **Species:** Species database management
5. **Gallery:** Photo gallery management
6. **Notifications:** Send notifications to users
7. **Settings:** System configuration
8. **Monitoring:** System health and performance monitoring

**Key Actions:**
- **Approve Bookings:** Click "Approve" button on pending bookings
- **Reject Bookings:** Click "Reject" button on pending bookings
- **Add User:** Click "Add User" button to create new accounts
- **Edit User:** Click pencil icon to modify user details
- **Delete User:** Click trash icon to remove user accounts
- **Add Species:** Click "Add Species" to enter new biodiversity data
- **Upload Photo:** Use gallery management to upload photos

---

### Tourist Dashboard

**Main Features:**
- **Browse Tours:** View available marshland tours
- **Create Bookings:** Book tours for specific dates
- **View My Bookings:** Track booking status and history
- **Gallery:** View marshland photo gallery
- **Notifications:** Receive system notifications
- **Profile:** Manage personal information

**Navigation Tabs:**
1. **Dashboard:** Overview of personal bookings and tours
2. **Tours:** Browse and book available tours
3. **My Bookings:** View booking status and history
4. **Gallery:** View marshland photos
5. **Notifications:** View system notifications
6. **Profile:** Update personal information

**Key Actions:**
- **Book a Tour:** Select a tour, choose date, enter number of visitors, submit booking
- **View Booking Status:** Check if booking is Pending, Approved, or Rejected
- **Mark Notification as Read:** Click on notification to mark as read

---

### Ecologist Dashboard

**Main Features:**
- **Species Database:** View and manage species data
- **Conservation Status:** Track conservation efforts
- **Research Data:** Access biodiversity research information
- **Species Images:** Upload and manage species photos
- **Analytics:** View conservation statistics

**Navigation Tabs:**
1. **Dashboard:** Overview of species statistics and conservation status
2. **Species:** Species database management
3. **Conservation:** Conservation tracking and reports
4. **Research:** Research data and findings

**Key Actions:**
- **Add Species:** Click "Add Species" to enter new species data
- **Edit Species:** Modify existing species information
- **Upload Image:** Add photos to species records
- **View Conservation Status:** Check conservation status of species

---

### Staff Dashboard

**Main Features:**
- **Booking Management:** View and manage daily bookings
- **Visitor Check-ins:** Process visitor arrivals
- **Daily Operations:** View daily schedule and tasks
- **Visitor Information:** Access visitor details

**Navigation Tabs:**
1. **Dashboard:** Overview of today's bookings and visitors
2. **Bookings:** Booking management interface
3. **Check-ins:** Visitor check-in system
4. **Schedule:** Daily schedule view

**Key Actions:**
- **Check-in Visitor:** Click "Check-in" button for arriving visitors
- **View Booking Details:** Click on booking to see full details
- **Update Booking Status:** Change booking status as needed

---

## Common Features

### Notifications
All users receive notifications for:
- Booking confirmations
- Booking approvals/rejections
- System announcements
- Important updates

**How to View:**
- Click the bell icon in the top navigation bar
- View notification list
- Click on notification to mark as read

### Profile Management
All users can:
- Update personal information
- Change password
- View account details

**How to Access:**
- Click profile icon in top right
- Select "Profile" from dropdown
- Update information as needed

### Image Uploads
- **Gallery Photos:** Upload marshland photos (Admin only)
- **Species Images:** Upload species documentation photos (Ecologist only)

**Supported Formats:** JPG, JPEG, PNG
**Maximum File Size:** 5MB

---

## Troubleshooting

### Login Issues

**Problem:** Cannot login with credentials
**Solution:**
1. Verify email and password are correct
2. Check that backend server is running on port 8083
3. Clear browser cache and cookies
4. Try refreshing the page

**Problem:** 403 Forbidden error
**Solution:**
1. Verify you have the correct role for the dashboard
2. Check that your JWT token is valid
3. Logout and login again

### Booking Issues

**Problem:** Cannot create booking
**Solution:**
1. Ensure you are logged in as a Tourist
2. Check that selected tour is active
3. Verify visit date is at least 1 day in the future
4. Check that there is available capacity

**Problem:** Booking approval fails
**Solution:**
1. Ensure you are logged in as Admin or Staff
2. Check that booking is in PENDING status
3. Verify there is sufficient capacity
4. Contact system administrator if issue persists

### Dashboard Issues

**Problem:** Dashboard not loading
**Solution:**
1. Check that backend API is running
2. Verify network connection
3. Check browser console for errors
4. Refresh the page

**Problem:** Data not displaying correctly
**Solution:**
1. Check that database is connected
2. Verify data exists in database
3. Refresh the page
4. Clear browser cache

### Image Upload Issues

**Problem:** Cannot upload image
**Solution:**
1. Check file format (JPG, JPEG, PNG only)
2. Verify file size is under 5MB
3. Check that uploads directory exists
4. Ensure you have proper permissions

---

## System Requirements

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Network Requirements
- Stable internet connection
- Access to localhost:3000 (frontend)
- Access to localhost:8083 (backend API)

---

## Support

For technical support or questions:
- Contact system administrator
- Check system logs for error details
- Review this manual for common solutions

---

## Security Notes

1. **Password Security:** Change default passwords after first login
2. **Session Management:** Always logout when finished
3. **Data Privacy:** Do not share credentials with unauthorized users
4. **System Access:** Only access features relevant to your role

---

## Version Information

- **System Version:** 1.0.0
- **Last Updated:** April 2026
- **Backend:** Spring Boot 3.x
- **Frontend:** React 18.x
- **Database:** MySQL 8.x

---

*This manual is for internal use only. Do not distribute outside authorized personnel.*
