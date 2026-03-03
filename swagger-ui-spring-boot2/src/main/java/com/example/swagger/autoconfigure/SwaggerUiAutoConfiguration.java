package com.example.swagger.autoconfigure;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.web.servlet.function.RequestPredicates.GET;
import static org.springframework.web.servlet.function.RouterFunctions.route;

@Configuration
@ConditionalOnWebApplication
@EnableConfigurationProperties(SwaggerUiProperties.class)
public class SwaggerUiAutoConfiguration implements WebMvcConfigurer {

    private final SwaggerUiProperties properties;
    private final ObjectMapper objectMapper;

    public SwaggerUiAutoConfiguration(SwaggerUiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 静态资源路径从 groupsApiPath 中提取
        String staticPath = extractStaticPath(properties.getGroupsApiPath());
        registry.addResourceHandler(staticPath + "/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0)
                .resourceChain(true);
    }

    /**
     * 从 groupsApiPath 中提取静态资源路径
     * 例如: "/swagger-new-ui/groups" -> "/swagger-new-ui"
     */
    private String extractStaticPath(String groupsApiPath) {
        if (groupsApiPath == null || groupsApiPath.isEmpty()) {
            return "/swagger-new-ui";
        }
        int lastSlash = groupsApiPath.lastIndexOf('/');
        if (lastSlash > 0) {
            return groupsApiPath.substring(0, lastSlash);
        }
        return groupsApiPath;
    }

    /**
     * 配置动态 HTML 路由，支持注入动态信息到 HTML 页面
     */
    @Bean
    public RouterFunction<ServerResponse> swaggerUiHtmlRouter() {
        return route(GET("/swagger-new-ui.html"), request -> {
            try {
                // 读取静态 HTML 模板
                ClassPathResource htmlResource = new ClassPathResource("static/index.html");
                String htmlContent = StreamUtils.copyToString(
                        htmlResource.getInputStream(), 
                        StandardCharsets.UTF_8
                );
                
                // 注入动态信息
                htmlContent = injectDynamicInfo(htmlContent, request);
                
                return ServerResponse.ok()
                        .contentType(org.springframework.http.MediaType.TEXT_HTML)
                        .body(htmlContent);
            } catch (IOException e) {
                return ServerResponse.notFound().build();
            }
        });
    }
    
    /**
     * 注入动态信息到 HTML 内容
     * 
     * @param htmlContent 原始 HTML 内容
     * @param request HTTP 请求对象
     * @return 注入后的 HTML 内容
     */
    private String injectDynamicInfo(String htmlContent, org.springframework.web.servlet.function.ServerRequest request) {
        // 构建配置对象
        Map<String, Object> config = new HashMap<>();
        config.put("path", request.path());
        config.put("baseUrl", properties.getBaseUrl());
        config.put("apiPath", properties.getApiPath());
        config.put("groupsPath", properties.getGroupsApiPath());
        
        // 合并用户自定义配置
        if (properties.getInjectConfig() != null && !properties.getInjectConfig().isEmpty()) {
            config.putAll(properties.getInjectConfig());
        }
        
        // 生成注入脚本
        String configJson;
        try {
            configJson = objectMapper.writeValueAsString(config);
        } catch (JsonProcessingException e) {
            configJson = "{}";
        }
        
        StringBuilder scriptBuilder = new StringBuilder();
        scriptBuilder.append("<script>\n");
        scriptBuilder.append("window.SWAGGER_UI_CONFIG = ").append(configJson).append(";\n");
        scriptBuilder.append("console.log('SWAGGER_UI_CONFIG:', window.SWAGGER_UI_CONFIG);\n");
        scriptBuilder.append("</script>\n");
        
        // 在 <head> 标签后注入脚本
        return htmlContent.replace("<head>", "<head>\n" + scriptBuilder.toString());
    }

    /**
     * 配置 Swagger 分组信息路由
     * 仅在 springdoc 存在时才生效
     */
    @Bean
    @ConditionalOnClass(GroupedOpenApi.class)
    public RouterFunction<ServerResponse> swaggerGroupsRouter(
            @Autowired(required = false) List<GroupedOpenApi> groupedOpenApis) {
        String groupsPath = properties.getGroupsApiPath();
        return route(GET(groupsPath), request -> {
            List<Map<String, String>> groups = new ArrayList<>();
            
            // 添加默认分组
            Map<String, String> defaultGroup = new HashMap<>();
            defaultGroup.put("name", "default");
            defaultGroup.put("displayName", "默认分组");
            defaultGroup.put("url", properties.getApiPath());
            groups.add(defaultGroup);
            
            // 添加用户定义的分组
            if (groupedOpenApis != null) {
                for (GroupedOpenApi groupedOpenApi : groupedOpenApis) {
                    String group = groupedOpenApi.getGroup();
                    Map<String, String> groupInfo = new HashMap<>();
                    groupInfo.put("name", group);
                    groupInfo.put("displayName", group);
                    groupInfo.put("url", properties.getApiPath() + "/" + group);
                    groups.add(groupInfo);
                }
            }
            
            String groupsJson;
            try {
                groupsJson = objectMapper.writeValueAsString(groups);
            } catch (JsonProcessingException e) {
                groupsJson = "[]";
            }
            
            return ServerResponse.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(groupsJson);
        });
    }
}
