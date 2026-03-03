package cn.coget.swagger.autoconfigure;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ConfigurationProperties(prefix = "swagger-new-ui")
public class SwaggerUiProperties {

    /**
     * Swagger UI 访问路径，支持多个路径（逗号分割）
     */
    private String paths = "/swagger-new-ui.html";

    /**
     * 分组 API 路径
     */
    private String groupsApiPath = "/swagger-new-ui/groups";

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

    public String getPaths() {
        return paths;
    }

    /**
     * 获取所有访问路径列表
     * 支持逗号分割的多个路径
     *
     * @return 访问路径列表
     */
    public List<String> getPathList() {
        if (!StringUtils.hasText(paths)) {
            return Arrays.asList("/swagger-new-ui.html");
        }
        return Arrays.stream(paths.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
    }

    public void setPaths(String paths) {
        this.paths = paths;
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
