package com.example.repeat_with_me_game;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class RepeatWithMeGameApplication {

	public static void main(String[] args) {
		SpringApplication.run(RepeatWithMeGameApplication.class, args);
	}

}
