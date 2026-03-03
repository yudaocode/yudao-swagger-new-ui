package cn.coget.examples.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Schema(description = "订单创建请求")
public class OrderCreateDTO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    private Long userId;

    @Schema(description = "收货地址", requiredMode = Schema.RequiredMode.REQUIRED)
    private AddressDTO shippingAddress;

    @Schema(description = "订单项列表", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<OrderItemDTO> items;

    @Schema(description = "备注", example = "尽快发货")
    private String remark;

    @Data
    @Schema(description = "地址信息")
    public static class AddressDTO {

        @Schema(description = "收货人姓名", requiredMode = Schema.RequiredMode.REQUIRED, example = "张三")
        private String name;

        @Schema(description = "手机号", requiredMode = Schema.RequiredMode.REQUIRED, example = "13800138000")
        private String phone;

        @Schema(description = "省份", requiredMode = Schema.RequiredMode.REQUIRED, example = "广东省")
        private String province;

        @Schema(description = "城市", requiredMode = Schema.RequiredMode.REQUIRED, example = "深圳市")
        private String city;

        @Schema(description = "详细地址", requiredMode = Schema.RequiredMode.REQUIRED, example = "南山区科技园")
        private String detail;
    }

    @Data
    @Schema(description = "订单项")
    public static class OrderItemDTO {

        @Schema(description = "商品ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1001")
        private Long productId;

        @Schema(description = "商品名称", example = "iPhone 15")
        private String productName;

        @Schema(description = "数量", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
        private Integer quantity;

        @Schema(description = "单价", requiredMode = Schema.RequiredMode.REQUIRED, example = "7999.00")
        private BigDecimal price;
    }
}
