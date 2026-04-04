-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 03, 2026 at 10:05 AM
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

--
-- Dumping data for table `species`
--

INSERT INTO `species` (`species_id`, `scientific_name`, `common_name`, `type`, `conservation_status`, `description`, `habitat`, `image_url`, `created_by`, `created_at`, `last_updated`) VALUES
(1, 'Cyperus papyrus', 'Papyrus', 'FLORA', 'Least Concern', 'A tall aquatic sedge that forms dense stands in wetlands. Essential for the ecosystem and traditional crafts.', 'Marsh edges and shallow water', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32'),
(2, 'Phragmites australis', 'Common Reed', 'FLORA', 'Least Concern', 'A widespread perennial grass found in wetlands across the world. Provides habitat for many bird species.', 'Marsh margins and shallow waters', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32'),
(3, 'Typha domingensis', 'Southern Cattail', 'FLORA', 'Least Concern', 'A marsh plant with distinctive brown flower spikes. Important for water filtration and wildlife habitat.', 'Freshwater marshes and pond edges', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32'),
(4, 'Nymphaea lotus', 'White Water Lily', 'FLORA', 'Least Concern', 'Beautiful aquatic plant with floating leaves and white flowers. Important for aquatic ecosystem balance.', 'Still waters of the marshland', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32'),
(5, 'Balearica regulorum', 'Grey Crowned Crane', 'FAUNA', 'Endangered', 'An iconic bird species with distinctive golden crown. National bird of Uganda and symbol of African wetlands.', 'Wetland edges and grasslands', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32'),
(6, 'Ardea cinerea', 'Grey Heron', 'FAUNA', 'Least Concern', 'A large wading bird commonly found in wetlands. Expert fish hunter with patient stalking behavior.', 'Shallow waters and marsh edges', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32'),
(7, 'Anas platyrhynchos', 'Mallard', 'FAUNA', 'Least Concern', 'One of the most recognizable duck species. Highly adaptable and found in various wetland habitats.', 'Open water and marsh areas', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32'),
(8, 'Haliaeetus vociferoides', 'African Fish Eagle', 'FAUNA', 'Vulnerable', 'Magnificent raptor with distinctive white head. Powerful predator that primarily feeds on fish.', 'Trees near water bodies', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32'),
(9, 'Ciconia ciconia', 'White Stork', 'FAUNA', 'Least Concern', 'Large migratory bird known for its long-distance migrations. Often associated with good luck in local cultures.', 'Wetlands and agricultural fields', NULL, NULL, '2026-02-25 08:36:32', '2026-02-25 08:36:32');

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
(15, 'admin@rugezi.rw', '$2a$10$W5tYBBPrUXzQau3FtdQp7.svC/f3X8vlwm7mZ3GJWqSEBrGbdr9Qi', 'Admin', 'User', 'ADMIN', '+250788123456', '2026-03-12 09:07:44', 1, '2026-03-12 09:07:44'),
(16, 'ecologist@rugezi.rw', '$2a$10$fxuJ0.xr0r6MW53prfOqGu3AbZ8o5yCcggmhdxcnXukbEWUSGEgA.', 'Jean', 'Munyaneza', 'ECOLOGIST', '+250788123457', '2026-03-12 09:07:44', 1, '2026-03-12 09:07:44'),
(17, 'tourist@rugezi.rw', '$2a$10$krsjgHZzwUkXHVcP5Was4.MAo0LRhDZ8nMbWJ0EGtCell3qpXgSfO', 'Sarah', 'Johnson', 'TOURIST', '+250788123458', '2026-03-12 09:07:44', 1, '2026-03-12 09:07:44'),
(18, 'staff@rugezi.rw', '$2a$10$59fDmcs1iJev7M/MOgDAEeJB6tQYznAsBdkKB0WlchnlhML2VR7/W', 'Emmanuel', 'Niyonzima', 'STAFF', '+250788123459', '2026-03-12 09:07:44', 1, '2026-03-12 09:07:44'),
(19, 'testuser@example.com', '$2a$10$Q29ZLHQ7PXXYS56vZkJwyuaYqWcAY7YuT/qxOaCdcLqbD9ucRk2HW', 'Test', 'User', 'TOURIST', '+250788123456', '2026-03-12 09:37:58', 1, '2026-03-12 09:37:58');

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
(56, '2026-04-22', 50, 0);

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
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `species`
--
ALTER TABLE `species`
  MODIFY `species_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `visit_date`
--
ALTER TABLE `visit_date`
  MODIFY `date_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

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
