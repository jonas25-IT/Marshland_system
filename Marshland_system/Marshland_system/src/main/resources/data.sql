-- Insert sample users
INSERT INTO user (email, password_hash, first_name, last_name, role, phone, is_active) VALUES
('admin@rugezi.rw', 'admin123', 'Admin', 'User', 'ADMIN', '+250788123456', TRUE),
('ecologist@rugezi.rw', 'admin123', 'Jean', 'Munyaneza', 'ECOLOGIST', '+250788123457', TRUE),
('tourist@rugezi.rw', 'admin123', 'Sarah', 'Johnson', 'TOURIST', '+250788123458', TRUE),
('staff@rugezi.rw', 'admin123', 'Emmanuel', 'Niyonzima', 'STAFF', '+250788123459', TRUE);

-- Insert sample species (Flora)
INSERT INTO species (scientific_name, common_name, type, conservation_status, description, habitat, created_by) VALUES
('Cyperus papyrus', 'Papyrus', 'FLORA', 'Least Concern', 'A tall aquatic sedge that forms dense stands in wetlands. Essential for the ecosystem and traditional crafts.', 'Marsh edges and shallow water', 2),
('Phragmites australis', 'Common Reed', 'FLORA', 'Least Concern', 'A widespread perennial grass found in wetlands across the world. Provides habitat for many bird species.', 'Marsh margins and shallow waters', 2),
('Typha domingensis', 'Southern Cattail', 'FLORA', 'Least Concern', 'A marsh plant with distinctive brown flower spikes. Important for water filtration and wildlife habitat.', 'Freshwater marshes and pond edges', 2),
('Nymphaea lotus', 'White Water Lily', 'FLORA', 'Least Concern', 'Beautiful aquatic plant with floating leaves and white flowers. Important for aquatic ecosystem balance.', 'Still waters of the marshland', 2);

-- Insert sample species (Fauna)
INSERT INTO species (scientific_name, common_name, type, conservation_status, description, habitat, created_by) VALUES
('Balearica regulorum', 'Grey Crowned Crane', 'FAUNA', 'Endangered', 'An iconic bird species with distinctive golden crown. National bird of Uganda and symbol of African wetlands.', 'Wetland edges and grasslands', 2),
('Ardea cinerea', 'Grey Heron', 'FAUNA', 'Least Concern', 'A large wading bird commonly found in wetlands. Expert fish hunter with patient stalking behavior.', 'Shallow waters and marsh edges', 2),
('Anas platyrhynchos', 'Mallard', 'FAUNA', 'Least Concern', 'One of the most recognizable duck species. Highly adaptable and found in various wetland habitats.', 'Open water and marsh areas', 2),
('Haliaeetus vociferoides', 'African Fish Eagle', 'FAUNA', 'Vulnerable', 'Magnificent raptor with distinctive white head. Powerful predator that primarily feeds on fish.', 'Trees near water bodies', 2),
('Ciconia ciconia', 'White Stork', 'FAUNA', 'Least Concern', 'Large migratory bird known for its long-distance migrations. Often associated with good luck in local cultures.', 'Wetlands and agricultural fields', 2);

-- Insert sample visit dates for the next 30 days
INSERT INTO visit_date (visit_date, max_capacity, current_bookings) VALUES
(DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 8 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 9 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 11 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 13 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 50, 0),
(DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 50, 0);
