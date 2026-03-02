package com.example.swagger.autoconfigure;

import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ConditionalOnWebApplication
@EnableConfigurationProperties(SwaggerUiProperties.class)
public class SwaggerUiAutoConfiguration implements WebMvcConfigurer {

    private final SwaggerUiProperties properties;

    public SwaggerUiAutoConfiguration(SwaggerUiProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(properties.getWebMvcUrlMapping() + "/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0)
                .resourceChain(true);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/swagger-ui.html")
                .setViewName("forward:" + properties.getWebMvcUrlMapping() + "/index.html");
    }
}