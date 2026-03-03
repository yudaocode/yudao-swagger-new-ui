package cn.coget.examples.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "商品信息")
public class ProductDTO {

    @Schema(description = "商品ID")
    private Long id;

    @Schema(description = "商品名称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "商品描述")
    private String description;

    @Schema(description = "价格", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal price;

    @Schema(description = "库存")
    private Integer stock;

    @Schema(description = "分类ID")
    private Long categoryId;

    @Schema(description = "状态：0-下架，1-上架")
    private Integer status;
}
