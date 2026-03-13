package cn.coget.examples.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "用户查询请求")
public class UserQueryDTO {

    @Schema(description = "用户名", requiredMode = Schema.RequiredMode.REQUIRED, example = "admin")
    private String username;

    @Schema(description = "页码", example = "1")
    private Integer pageNum;

    @Schema(description = "每页数量", example = "20")
    private Integer pageSize;
}
