package com.bakery.bakery.repository;

import com.bakery.bakery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
