package com.example.examples.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Schema(description = "订单信息")
public class OrderVO {

    @Schema(description = "订单ID")
    private Long id;

    @Schema(description = "订单号")
    private String orderNo;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "订单金额")
    private BigDecimal amount;

    @Schema(description = "创建时间")
    private Date createTime;
}