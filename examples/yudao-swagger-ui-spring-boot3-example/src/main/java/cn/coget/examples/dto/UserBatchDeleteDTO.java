package cn.coget.examples.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "批量删除用户请求")
public class UserBatchDeleteDTO {

    @Schema(description = "用户ID列表", requiredMode = Schema.RequiredMode.REQUIRED, example = "[1, 2, 3]")
    private List<Long> ids;

    @Schema(description = "删除原因", example = "批量清理无效用户")
    private String reason;
}
