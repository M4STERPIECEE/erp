package com.erp.erp.infrastructure.config;

import com.erp.erp.adapter.out.persistence.repository.RoleRepository;
import com.erp.erp.adapter.out.persistence.repository.UserRepository;
import com.erp.erp.domain.model.Role;
import com.erp.erp.domain.model.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role(null, "admin");
            Role userRole = new Role(null, "employe");
            Role rhRole = new Role(null, "rh");
            roleRepository.saveAll(Set.of(adminRole, userRole, rhRole));
        }

        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName("admin").orElseThrow();
            User admin = new User();
            admin.setEmail("admin@erp.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.getRoles().add(adminRole);
            userRepository.save(admin);
        }
    }
}
