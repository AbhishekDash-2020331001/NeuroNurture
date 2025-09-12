package com.example.nuru_chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class NuruChatApplication {

	public static void main(String[] args) {
		SpringApplication.run(NuruChatApplication.class, args);
	}

}
