package com.example.examples.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "错误响应")
public class ErrorResponse {

    @Schema(description = "错误码")
    private Integer code;

    @Schema(description = "错误消息")
    private String message;

    @Schema(description = "错误详情")
    private String details;

    @Schema(description = "时间戳")
    private Long timestamp;

    public static ErrorResponse of(Integer code, String message, String details) {
        ErrorResponse response = new ErrorResponse();
        response.setCode(code);
        response.setMessage(message);
        response.setDetails(details);
        response.setTimestamp(System.currentTimeMillis());
        return response;
    }
}
