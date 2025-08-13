package com.example.gesture_game;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class GestureGameApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestureGameApplication.class, args);
	}

}
