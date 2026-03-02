package com.example.examples.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "用户查询请求")
public class UserQueryDTO {

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "页码")
    private Integer pageNum;

    @Schema(description = "每页数量")
    private Integer pageSize;
}