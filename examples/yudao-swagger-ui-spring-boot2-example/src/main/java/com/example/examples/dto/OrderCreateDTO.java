package com.example.examples.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Schema(description = "订单创建请求")
public class OrderCreateDTO {

    @Schema(description = "用户ID", required = true, example = "1")
    private Long userId;

    @Schema(description = "收货地址", required = true)
    private AddressDTO shippingAddress;

    @Schema(description = "订单项列表", required = true)
    private List<OrderItemDTO> items;

    @Schema(description = "备注", example = "尽快发货")
    private String remark;

    @Data
    @Schema(description = "地址信息")
    public static class AddressDTO {

        @Schema(description = "收货人姓名", required = true, example = "张三")
        private String name;

        @Schema(description = "手机号", required = true, example = "13800138000")
        private String phone;

        @Schema(description = "省份", required = true, example = "广东省")
        private String province;

        @Schema(description = "城市", required = true, example = "深圳市")
        private String city;

        @Schema(description = "详细地址", required = true, example = "南山区科技园")
        private String detail;
    }

    @Data
    @Schema(description = "订单项")
    public static class OrderItemDTO {

        @Schema(description = "商品ID", required = true, example = "1001")
        private Long productId;

        @Schema(description = "商品名称", example = "iPhone 15")
        private String productName;

        @Schema(description = "数量", required = true, example = "1")
        private Integer quantity;

        @Schema(description = "单价", required = true, example = "7999.00")
        private BigDecimal price;
    }
}
