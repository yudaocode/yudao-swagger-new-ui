package cn.coget.examples.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "多级用户信息请求")
public class UserMultiLevelDTO {

    @Schema(description = "用户基本信息", requiredMode = Schema.RequiredMode.REQUIRED)
    private UserInfo userInfo;

    @Schema(description = "用户地址列表")
    private List<Address> addresses;

    @Schema(description = "用户配置")
    private UserConfig config;

    @Data
    @Schema(description = "用户基本信息")
    public static class UserInfo {
        @Schema(description = "用户名", requiredMode = Schema.RequiredMode.REQUIRED, example = "zhangsan")
        private String username;

        @Schema(description = "邮箱", example = "zhangsan@example.com")
        private String email;

        @Schema(description = "个人资料")
        private Profile profile;
    }

    @Data
    @Schema(description = "个人资料")
    public static class Profile {
        @Schema(description = "真实姓名", example = "张三")
        private String realName;

        @Schema(description = "年龄", example = "25")
        private Integer age;

        @Schema(description = "性别", example = "male")
        private String gender;
    }

    @Data
    @Schema(description = "地址信息")
    public static class Address {
        @Schema(description = "地址类型", example = "home")
        private String type;

        @Schema(description = "详细地址")
        private AddressDetail detail;
    }

    @Data
    @Schema(description = "地址详细信息")
    public static class AddressDetail {
        @Schema(description = "省份", example = "北京市")
        private String province;

        @Schema(description = "城市", example = "北京市")
        private String city;

        @Schema(description = "街道", example = "朝阳区xxx街道")
        private String street;

        @Schema(description = "邮编", example = "100000")
        private String zipCode;
    }

    @Data
    @Schema(description = "用户配置")
    public static class UserConfig {
        @Schema(description = "是否启用通知", example = "true")
        private Boolean enableNotification;

        @Schema(description = "语言设置", example = "zh-CN")
        private String language;

        @Schema(description = "主题设置", example = "dark")
        private String theme;

        @Schema(description = "隐私设置")
        private PrivacySettings privacy;
    }

    @Data
    @Schema(description = "隐私设置")
    public static class PrivacySettings {
        @Schema(description = "是否公开邮箱", example = "false")
        private Boolean showEmail;

        @Schema(description = "是否公开电话", example = "false")
        private Boolean showPhone;

        @Schema(description = "谁可以查看我的信息", example = "friends")
        private String visibility;
    }
}
