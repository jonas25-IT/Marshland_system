package com.rugezi.marshland_system.service;

import com.rugezi.marshland_system.entity.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private List<User> users = new ArrayList<>();

    public List<User> getAllUsers() {
        return users;
    }

    public User createUser(String name, String email) {
        User user = new User();
        user.setId((long) (users.size() + 1));
        user.setName(name);
        user.setEmail(email);
        user.setRole("USER");
        users.add(user);
        return user;
    }
}
