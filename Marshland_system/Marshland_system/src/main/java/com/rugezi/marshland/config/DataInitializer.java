package com.rugezi.marshland.config;

import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.SpeciesType;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.UserRole;
import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.service.SpeciesService;
import com.rugezi.marshland.service.UserService;
import com.rugezi.marshland.service.VisitDateService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final SpeciesService speciesService;
    private final VisitDateService visitDateService;

    public DataInitializer(UserService userService, SpeciesService speciesService,
                           VisitDateService visitDateService) {
        this.userService = userService;
        this.speciesService = speciesService;
        this.visitDateService = visitDateService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Enable data initialization for testing
        initializeUsers();
        initializeSpecies();
        initializeVisitDates();
        System.out.println("Data initialization completed successfully");
    }

    private void initializeUsers() {

        if (userService.findByEmail("admin@rugezi.rw").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@rugezi.rw");
            admin.setPasswordHash("admin123");  // Set passwordHash directly (will be encoded)
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(UserRole.ADMIN);
            admin.setPhone("+250788123456");
            userService.registerUser(admin);
        }

        if (userService.findByEmail("ecologist@rugezi.rw").isEmpty()) {
            User ecologist = new User();
            ecologist.setEmail("ecologist@rugezi.rw");
            ecologist.setPasswordHash("admin123");
            ecologist.setFirstName("Jean");
            ecologist.setLastName("Munyaneza");
            ecologist.setRole(UserRole.ECOLOGIST);
            ecologist.setPhone("+250788123457");
            userService.registerUser(ecologist);
        }

        if (userService.findByEmail("tourist@rugezi.rw").isEmpty()) {
            User tourist = new User();
            tourist.setEmail("tourist@rugezi.rw");
            tourist.setPasswordHash("admin123");
            tourist.setFirstName("Sarah");
            tourist.setLastName("Johnson");
            tourist.setRole(UserRole.TOURIST);
            tourist.setPhone("+250788123458");
            userService.registerUser(tourist);
        }

        if (userService.findByEmail("staff@rugezi.rw").isEmpty()) {
            User staff = new User();
            staff.setEmail("staff@rugezi.rw");
            staff.setPasswordHash("admin123");
            staff.setFirstName("Emmanuel");
            staff.setLastName("Niyonzima");
            staff.setRole(UserRole.STAFF);
            staff.setPhone("+250788123459");
            userService.registerUser(staff);
        }
    }

    private void initializeSpecies() {

        User ecologist = userService.findByEmail("ecologist@rugezi.rw").orElse(null);
        if (ecologist == null) return;

        if (speciesService.findByScientificName("Cyperus papyrus").isEmpty()) {
            Species papyrus = new Species();
            papyrus.setScientificName("Cyperus papyrus");
            papyrus.setCommonName("Papyrus");
            papyrus.setType(SpeciesType.FLORA);
            papyrus.setConservationStatus("Least Concern");
            papyrus.setDescription("A tall aquatic sedge that forms dense stands in wetlands.");
            papyrus.setHabitat("Marsh edges and shallow water");
            papyrus.setImageUrl("https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80");
            speciesService.createSpecies(papyrus, ecologist);
        }

        if (speciesService.findByScientificName("Phragmites australis").isEmpty()) {
            Species reed = new Species();
            reed.setScientificName("Phragmites australis");
            reed.setCommonName("Common Reed");
            reed.setType(SpeciesType.FLORA);
            reed.setConservationStatus("Least Concern");
            reed.setDescription("A widespread perennial grass found in wetlands.");
            reed.setHabitat("Marsh margins and shallow waters");
            reed.setImageUrl("https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80");
            speciesService.createSpecies(reed, ecologist);
        }

        if (speciesService.findByScientificName("Balearica regulorum").isEmpty()) {
            Species crane = new Species();
            crane.setScientificName("Balearica regulorum");
            crane.setCommonName("Grey Crowned Crane");
            crane.setType(SpeciesType.FAUNA);
            crane.setConservationStatus("Endangered");
            crane.setDescription("An iconic bird with a golden crown.");
            crane.setHabitat("Wetland edges and grasslands");
            crane.setImageUrl("https://images.unsplash.com/photo-1552728089-a57d840b9b4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80");
            speciesService.createSpecies(crane, ecologist);
        }

        if (speciesService.findByScientificName("Ardea cinerea").isEmpty()) {
            Species heron = new Species();
            heron.setScientificName("Ardea cinerea");
            heron.setCommonName("Grey Heron");
            heron.setType(SpeciesType.FAUNA);
            heron.setConservationStatus("Least Concern");
            heron.setDescription("A large wading bird commonly found in wetlands.");
            heron.setHabitat("Shallow waters and marsh edges");
            heron.setImageUrl("https://images.unsplash.com/photo-1558592672-0540e816f8e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80");
            speciesService.createSpecies(heron, ecologist);
        }
    }

    private void initializeVisitDates() {

        LocalDate today = LocalDate.now();

        for (int i = 1; i <= 30; i++) {
            LocalDate visitDate = today.plusDays(i);

            if (!visitDateService.existsByVisitDate(visitDate)) {
                VisitDate newVisitDate = new VisitDate();
                newVisitDate.setVisitDate(visitDate);
                newVisitDate.setMaxCapacity(50);
                newVisitDate.setCurrentBookings(0);

                visitDateService.createVisitDate(newVisitDate);
            }
        }
    }
}

