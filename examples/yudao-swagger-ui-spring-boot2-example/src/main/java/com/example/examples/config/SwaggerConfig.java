package com.example.examples.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Swagger UI 示例 API")
                        .description("Spring Boot 2.x SpringDoc OpenAPI 示例")
                        .version("1.0")
                        .contact(new Contact()
                                .name("Example")
                                .email("example@example.com")));
    }
}