package com.bakery.bakery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.bakery.bakery")
public class BakeryApplication {
    public static void main(String[] args) {
        SpringApplication.run(BakeryApplication.class, args);
    }
}
