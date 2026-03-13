-- Database: rugezi_marshland_db
CREATE DATABASE IF NOT EXISTS rugezi_marshland_db;
USE rugezi_marshland_db;

-- 1. Table: user
CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('ADMIN', 'ECOLOGIST', 'TOURIST', 'STAFF') NOT NULL,
    phone VARCHAR(20),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Table: species
CREATE TABLE species (
    species_id INT PRIMARY KEY AUTO_INCREMENT,
    scientific_name VARCHAR(100) UNIQUE NOT NULL,
    common_name VARCHAR(100) NOT NULL,
    type ENUM('Flora', 'Fauna') NOT NULL,
    conservation_status VARCHAR(50),
    description TEXT,
    habitat VARCHAR(255),
    image_url VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(user_id) ON DELETE SET NULL
);

-- 3. Table: visit_date
CREATE TABLE visit_date (
    date_id INT PRIMARY KEY AUTO_INCREMENT,
    visit_date DATE UNIQUE NOT NULL,
    max_capacity INT NOT NULL,
    current_bookings INT DEFAULT 0
);

-- 4. Table: booking
CREATE TABLE booking (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date_id INT NOT NULL,
    number_of_visitors INT NOT NULL CHECK (number_of_visitors > 0),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booking_status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    special_requests TEXT,
    approved_by INT,
    approval_date TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (date_id) REFERENCES visit_date(date_id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES user(user_id) ON DELETE SET NULL
);

-- 5. Table: feedback
CREATE TABLE feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT UNIQUE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
);

-- Triggers for capacity management
DELIMITER //

CREATE TRIGGER after_booking_approval
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    -- Only increment if the status changed from something else to 'Approved'
    IF NEW.booking_status = 'Approved' AND OLD.booking_status != 'Approved' THEN
        UPDATE visit_date 
        SET current_bookings = current_bookings + NEW.number_of_visitors
        WHERE date_id = NEW.date_id;
    END IF;
    
    -- Decrement if a previously approved booking is cancelled or rejected
    IF OLD.booking_status = 'Approved' AND NEW.booking_status != 'Approved' THEN
        UPDATE visit_date 
        SET current_bookings = current_bookings - OLD.number_of_visitors
        WHERE date_id = OLD.date_id;
    END IF;
END //

CREATE TRIGGER before_booking_insert
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE remaining_slots INT;

    -- Calculate remaining capacity for the chosen date
    SELECT (max_capacity - current_bookings) INTO remaining_slots
    FROM visit_date
    WHERE date_id = NEW.date_id;

    -- If the new booking exceeds available slots, throw an error
    IF NEW.number_of_visitors > remaining_slots THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Booking failed: Number of visitors exceeds available capacity for this date.';
    END IF;
END //

DELIMITER ;
