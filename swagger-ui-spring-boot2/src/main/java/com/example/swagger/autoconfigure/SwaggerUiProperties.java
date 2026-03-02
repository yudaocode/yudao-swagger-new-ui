package com.example.swagger.autoconfigure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "swagger-ui")
public class SwaggerUiProperties {

    private String webMvcUrlMapping = "/swagger-ui";

    public String getWebMvcUrlMapping() {
        return webMvcUrlMapping;
    }

    public void setWebMvcUrlMapping(String webMvcUrlMapping) {
        this.webMvcUrlMapping = webMvcUrlMapping;
    }
}