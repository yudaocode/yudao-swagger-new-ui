package com.example.examples.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.GroupedOpenApi;
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

//    /**
//     * 用户 API 分组
//     * 包含用户管理相关的接口
//     */
//    @Bean
//    public GroupedOpenApi userApi() {
//        return GroupedOpenApi.builder()
//                .group("用户API")
//                .pathsToMatch("/api/users/**")
//                .build();
//    }
//
//    /**
//     * 订单 API 分组
//     * 包含订单管理相关的接口
//     */
//    @Bean
//    public GroupedOpenApi orderApi() {
//        return GroupedOpenApi.builder()
//                .group("订单API")
//                .pathsToMatch("/api/orders/**")
//                .build();
//    }
//
//    /**
//     * 商品 API 分组
//     * 包含商品管理相关的接口
//     */
//    @Bean
//    public GroupedOpenApi productApi() {
//        return GroupedOpenApi.builder()
//                .group("商品API")
//                .pathsToMatch("/api/products/**")
//                .build();
//    }
}
