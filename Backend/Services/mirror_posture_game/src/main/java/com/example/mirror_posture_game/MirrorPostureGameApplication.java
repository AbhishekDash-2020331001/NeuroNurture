package com.example.mirror_posture_game;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MirrorPostureGameApplication {

	public static void main(String[] args) {
		SpringApplication.run(MirrorPostureGameApplication.class, args);
	}

}
