package com.example.swagger.autoconfigure;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "swagger-ui")
public class SwaggerUiProperties {

    /**
     * static 静态文件路径
     */
    private String webMvcUrlMapping = "/swagger-ui";

    /**
     * Swagger UI 的基础 URL 路径
     */
    private String baseUrl = "/";

    /**
     * API 文档的路径
     */
    private String apiPath = "/v3/api-docs";

    /**
     * 需要注入到 HTML 页面的动态信息
     * 这些信息会被注入到 window.SWAGGER_UI_CONFIG 对象中
     */
    private Map<String, Object> injectConfig = new HashMap<>();

    public String getWebMvcUrlMapping() {
        return webMvcUrlMapping;
    }

    public void setWebMvcUrlMapping(String webMvcUrlMapping) {
        this.webMvcUrlMapping = webMvcUrlMapping;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiPath() {
        return apiPath;
    }

    public void setApiPath(String apiPath) {
        this.apiPath = apiPath;
    }

    public Map<String, Object> getInjectConfig() {
        return injectConfig;
    }

    public void setInjectConfig(Map<String, Object> injectConfig) {
        this.injectConfig = injectConfig;
    }
}
