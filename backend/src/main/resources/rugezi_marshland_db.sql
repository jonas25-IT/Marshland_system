-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2026 at 01:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rugezi_marshland_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_id` int(11) NOT NULL,
  `number_of_visitors` int(11) NOT NULL CHECK (`number_of_visitors` > 0),
  `booking_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `booking_status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `special_requests` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`booking_id`, `user_id`, `date_id`, `number_of_visitors`, `booking_date`, `booking_status`, `special_requests`, `approved_by`, `approval_date`) VALUES
(1, 15, 1, 2, '2026-04-07 08:43:21', 'Pending', 'Test booking', NULL, NULL),
(2, 15, 1, 2, '2026-04-07 09:08:09', 'Pending', 'Test booking from admin', NULL, NULL);

--
-- Triggers `booking`
--
DELIMITER $$
CREATE TRIGGER `after_booking_approval` AFTER UPDATE ON `booking` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_booking_insert` BEFORE INSERT ON `booking` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` bigint(20) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comments` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gallery_photos`
--

CREATE TABLE `gallery_photos` (
  `photo_id` bigint(20) NOT NULL,
  `category` varchar(255) NOT NULL,
  `content_type` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `last_updated` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `upload_date` datetime(6) NOT NULL,
  `uploaded_by` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `species`
--

CREATE TABLE `species` (
  `species_id` bigint(20) NOT NULL,
  `scientific_name` varchar(100) NOT NULL,
  `common_name` varchar(100) NOT NULL,
  `type` enum('FLORA','FAUNA') NOT NULL,
  `conservation_status` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `habitat` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `role` enum('ADMIN','ECOLOGIST','TOURIST','STAFF') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `phone`, `registration_date`, `is_active`, `last_updated`) VALUES
(15, 'admin@rugezi.rw', '$2a$10$W5tYBBPrUXzQau3FtdQp7.svC/f3X8vlwm7mZ3GJWqSEBrGbdr9Qi', 'Admin', 'Jonas', 'ADMIN', '+250788123456', '2026-03-12 09:07:44', 1, '2026-04-07 08:03:28'),
(16, 'ecologist@rugezi.rw', '$2a$10$fxuJ0.xr0r6MW53prfOqGu3AbZ8o5yCcggmhdxcnXukbEWUSGEgA.', 'Jean', 'Munyaneza', 'ECOLOGIST', '+250788123457', '2026-03-12 09:07:44', 1, '2026-03-12 09:07:44'),
(17, 'tourist@rugezi.rw', '$2a$10$krsjgHZzwUkXHVcP5Was4.MAo0LRhDZ8nMbWJ0EGtCell3qpXgSfO', 'Sarah', 'Johnson', 'TOURIST', '+250788123458', '2026-03-12 09:07:44', 1, '2026-03-12 09:07:44'),
(18, 'staff@rugezi.rw', '$2a$10$59fDmcs1iJev7M/MOgDAEeJB6tQYznAsBdkKB0WlchnlhML2VR7/W', 'Emmanuel', 'Niyonzima', 'STAFF', '+250788123459', '2026-03-12 09:07:44', 1, '2026-03-12 09:07:44'),
(22, 'test.admin@rugezi.rw', '$2a$10$dcvUTIHMdcKx2d715poA/uuACqWQiWlbFMZkfrAROw5Pef/uK07Bq', 'Test', 'Admin', 'ADMIN', '+250788123460', '2026-04-09 09:30:48', 1, '2026-04-09 09:30:48'),
(23, 'test.ecologist@rugezi.rw', '$2a$10$MKAfB1/.4OQ0GDW3ghCjze1npmBrLr/9aBJ/xQfaa2vQLrhou7B1q', 'Test', 'Ecologist', 'ECOLOGIST', '+250788123461', '2026-04-09 09:30:49', 1, '2026-04-09 09:30:49'),
(24, 'test.tourist@rugezi.rw', '$2a$10$c49JlgJKQUWWhVXT5bS9Euc0BD4TDivkwSKlJb3BS7Krx/Nz5eabW', 'Test', 'Tourist', 'TOURIST', '+250788123462', '2026-04-09 09:30:49', 1, '2026-04-09 09:30:49'),
(25, 'test.staff@rugezi.rw', '$2a$10$g8Ia/WHfytetQgmESwgjIuE5iPcH.nvzV9UiO1spgAA1gLRgSirpi', 'Test', 'Staff', 'STAFF', '+250788123463', '2026-04-09 09:30:50', 1, '2026-04-09 09:30:50');

-- --------------------------------------------------------

--
-- Table structure for table `visit_date`
--

CREATE TABLE `visit_date` (
  `date_id` int(11) NOT NULL,
  `visit_date` date NOT NULL,
  `max_capacity` int(11) NOT NULL,
  `current_bookings` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `notification`
--

CREATE TABLE IF NOT EXISTS `notification` (
  `notification_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` TIMESTAMP NULL,
  `link` VARCHAR(500) NULL,
  `metadata` JSON NULL,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Dumping data for table `visit_date`
--

INSERT INTO `visit_date` (`date_id`, `visit_date`, `max_capacity`, `current_bookings`) VALUES
(1, '2026-02-26', 50, 0),
(2, '2026-02-27', 50, 0),
(3, '2026-02-28', 50, 0),
(4, '2026-03-01', 50, 0),
(5, '2026-03-02', 50, 0),
(6, '2026-03-03', 50, 0),
(7, '2026-03-04', 50, 0),
(8, '2026-03-05', 50, 0),
(9, '2026-03-06', 50, 0),
(10, '2026-03-07', 50, 0),
(11, '2026-03-08', 50, 0),
(12, '2026-03-09', 50, 0),
(13, '2026-03-10', 50, 0),
(14, '2026-03-11', 50, 0),
(15, '2026-03-12', 50, 0),
(16, '2026-03-13', 50, 0),
(17, '2026-03-14', 50, 0),
(18, '2026-03-15', 50, 0),
(19, '2026-03-16', 50, 0),
(20, '2026-03-17', 50, 0),
(21, '2026-03-18', 50, 0),
(22, '2026-03-19', 50, 0),
(23, '2026-03-20', 50, 0),
(24, '2026-03-21', 50, 0),
(25, '2026-03-22', 50, 0),
(26, '2026-03-23', 50, 0),
(27, '2026-03-24', 50, 0),
(28, '2026-03-25', 50, 0),
(29, '2026-03-26', 50, 0),
(30, '2026-03-27', 50, 0),
(31, '2026-03-28', 50, 0),
(32, '2026-03-29', 50, 0),
(33, '2026-03-30', 50, 0),
(34, '2026-03-31', 50, 0),
(35, '2026-04-01', 50, 0),
(36, '2026-04-02', 50, 0),
(37, '2026-04-03', 50, 0),
(38, '2026-04-04', 50, 0),
(39, '2026-04-05', 50, 0),
(40, '2026-04-06', 50, 0),
(41, '2026-04-07', 50, 0),
(42, '2026-04-08', 50, 0),
(43, '2026-04-09', 50, 0),
(44, '2026-04-10', 50, 0),
(45, '2026-04-11', 50, 0),
(46, '2026-04-12', 50, 0),
(47, '2026-04-13', 50, 0),
(48, '2026-04-14', 50, 0),
(49, '2026-04-15', 50, 0),
(50, '2026-04-16', 50, 0),
(51, '2026-04-17', 50, 0),
(52, '2026-04-18', 50, 0),
(53, '2026-04-19', 50, 0),
(54, '2026-04-20', 50, 0),
(55, '2026-04-21', 50, 0),
(56, '2026-04-22', 50, 0),
(57, '2026-04-23', 50, 0),
(58, '2026-04-24', 50, 0),
(59, '2026-04-25', 50, 0),
(60, '2026-04-26', 50, 0),
(61, '2026-04-27', 50, 0),
(62, '2026-04-28', 50, 0),
(63, '2026-04-29', 50, 0),
(64, '2026-04-30', 50, 0),
(65, '2026-05-01', 50, 0),
(66, '2026-05-02', 50, 0),
(67, '2026-05-03', 50, 0),
(68, '2026-05-04', 50, 0),
(69, '2026-05-05', 50, 0),
(70, '2026-05-06', 50, 0),
(71, '2026-05-07', 50, 0),
(72, '2026-05-08', 50, 0),
(73, '2026-05-09', 50, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `date_id` (`date_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`);

--
-- Indexes for table `gallery_photos`
--
ALTER TABLE `gallery_photos`
  ADD PRIMARY KEY (`photo_id`),
  ADD KEY `FKh7uwk30k8trg3xxnallqurikj` (`uploaded_by`);

--
-- Indexes for table `species`
--
ALTER TABLE `species`
  ADD PRIMARY KEY (`species_id`),
  ADD UNIQUE KEY `scientific_name` (`scientific_name`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `visit_date`
--
ALTER TABLE `visit_date`
  ADD PRIMARY KEY (`date_id`),
  ADD UNIQUE KEY `visit_date` (`visit_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gallery_photos`
--
ALTER TABLE `gallery_photos`
  MODIFY `photo_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `species`
--
ALTER TABLE `species`
  MODIFY `species_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `visit_date`
--
ALTER TABLE `visit_date`
  MODIFY `date_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`date_id`) REFERENCES `visit_date` (`date_id`),
  ADD CONSTRAINT `booking_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `species`
--
ALTER TABLE `species`
  ADD CONSTRAINT `species_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
