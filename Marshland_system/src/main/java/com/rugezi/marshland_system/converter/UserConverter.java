package com.rugezi.marshland_system.converter;

import com.rugezi.marshland_system.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserConverter {

    public String userToString(User user) {
        return "User{id=" + user.getId() + ", name='" + user.getName() + "', email='" + user.getEmail() + "'}";
    }
}
