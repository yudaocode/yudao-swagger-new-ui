package com.example.swagger.autoconfigure;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "swagger-ui")
public class SwaggerUiProperties {

    /**
     * Swagger UI HTML 页面路径
     */
    private String htmlPath = "/swagger-ui.html";

    /**
     * 分组 API 路径
     */
    private String groupsApiPath = "/swagger-ui/groups";

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

    public String getHtmlPath() {
        return htmlPath;
    }

    public void setHtmlPath(String htmlPath) {
        this.htmlPath = htmlPath;
    }

    public String getGroupsApiPath() {
        return groupsApiPath;
    }

    public void setGroupsApiPath(String groupsApiPath) {
        this.groupsApiPath = groupsApiPath;
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
