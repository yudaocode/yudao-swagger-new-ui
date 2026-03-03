package cn.coget.examples.controller;

import cn.coget.examples.dto.UserCreateDTO;
import cn.coget.examples.dto.UserQueryDTO;
import cn.coget.examples.dto.UserUpdateDTO;
import cn.coget.examples.vo.ErrorResponse;
import cn.coget.examples.vo.Result;
import cn.coget.examples.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "用户管理")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Operation(summary = "获取用户列表", description = "根据查询条件获取用户列表，支持分页")
    @GetMapping
    public Result<List<UserVO>> getUsers(
            @Parameter(description = "查询条件") UserQueryDTO query,
            @Parameter(description = "额外参数1") @RequestParam(required = false) String var1) {
        List<UserVO> users = new ArrayList<>();
        UserVO user = new UserVO();
        user.setId(1L);
        user.setUsername("admin");
        user.setEmail("admin@example.com");
        users.add(user);
        return Result.success(users);
    }

    @Operation(summary = "获取用户详情", description = "根据用户ID获取用户详细信息")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功"),
            @ApiResponse(responseCode = "404", description = "用户不存在",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public Result<UserVO> getUserInfo(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id,
            @Parameter(description = "用户名") @RequestParam(required = false) String name) {
        UserVO user = new UserVO();
        user.setId(id);
        user.setUsername("admin");
        user.setEmail("admin@example.com");
        return Result.success(user);
    }

    @Operation(summary = "创建用户", description = "创建新用户")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(responseCode = "400", description = "参数错误",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<Result<UserVO>> createUser(
            @org.springframework.web.bind.annotation.RequestBody UserCreateDTO dto) {
        UserVO user = new UserVO();
        user.setId(1L);
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(Result.success(user));
    }

    @Operation(summary = "更新用户", description = "更新用户信息")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "更新成功"),
            @ApiResponse(responseCode = "404", description = "用户不存在",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    public Result<UserVO> updateUser(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody UserUpdateDTO dto) {
        UserVO user = new UserVO();
        user.setId(id);
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        return Result.success(user);
    }

    @Operation(summary = "删除用户", description = "根据用户ID删除用户")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "删除成功"),
            @ApiResponse(responseCode = "404", description = "用户不存在",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "批量删除用户", description = "根据用户ID列表批量删除用户")
    @DeleteMapping("/batch")
    public Result<Integer> batchDeleteUsers(
            @Parameter(description = "用户ID列表", required = true) @RequestBody List<Long> ids) {
        return Result.success(ids.size());
    }

    @Operation(summary = "用户登录", description = "用户登录接口，返回用户信息")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "登录成功",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Result.class))),
            @ApiResponse(responseCode = "401", description = "认证失败",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "账号被锁定",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Parameter(description = "用户名", required = true) @RequestParam String username,
            @Parameter(description = "密码", required = true) @RequestParam String password) {

        if (username == null || username.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.of(401, "认证失败", "用户名不能为空"));
        }

        if ("locked".equals(username)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ErrorResponse.of(403, "账号被锁定", "请联系管理员解锁"));
        }

        if ("error".equals(username)) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of(500, "服务器内部错误", "请稍后重试"));
        }

        UserVO user = new UserVO();
        user.setId(1L);
        user.setUsername(username);
        user.setEmail(username + "@example.com");

        return ResponseEntity.ok(Result.success(user));
    }

    @Operation(summary = "修改密码", description = "用户修改密码")
    @PatchMapping("/{id}/password")
    public Result<Boolean> changePassword(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id,
            @Parameter(description = "旧密码", required = true) @RequestParam String oldPassword,
            @Parameter(description = "新密码", required = true) @RequestParam String newPassword) {
        return Result.success(true);
    }

    @Operation(summary = "检查用户名是否存在", description = "检查用户名是否已被使用")
    @GetMapping("/check-username")
    public Result<Boolean> checkUsername(
            @Parameter(description = "用户名", required = true) @RequestParam String username) {
        return Result.success("admin".equals(username));
    }

    @Operation(summary = "获取用户角色列表", description = "获取指定用户的所有角色")
    @GetMapping("/{id}/roles")
    public Result<List<String>> getUserRoles(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id) {
        List<String> roles = new ArrayList<>();
        roles.add("ROLE_ADMIN");
        roles.add("ROLE_USER");
        return Result.success(roles);
    }

    @Operation(summary = "导出用户数据", description = "导出用户数据为文件")
    @GetMapping("/export")
    public ResponseEntity<String> exportUsers(
            @Parameter(description = "文件格式") @RequestParam(defaultValue = "xlsx") String format) {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=users." + format)
                .body("id,username,email\n1,admin,admin@example.com\n2,user,user@example.com");
    }

    @Operation(summary = "上传头像", description = "上传用户头像图片")
    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, Object>> uploadAvatar(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id,
            @Parameter(description = "头像文件", required = true)
            @RequestPart("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        result.put("userId", id);
        result.put("fileName", file.getOriginalFilename());
        result.put("fileSize", file.getSize());
        result.put("contentType", file.getContentType());
        result.put("url", "/uploads/avatars/" + id + "/" + file.getOriginalFilename());
        return Result.success(result);
    }

    @Operation(summary = "上传多个文件", description = "批量上传文件")
    @PostMapping(value = "/upload-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<List<Map<String, Object>>> uploadFiles(
            @Parameter(description = "文件列表", required = true)
            @RequestPart("files") MultipartFile[] files,
            @Parameter(description = "文件类型") @RequestParam(required = false) String type) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (MultipartFile file : files) {
            Map<String, Object> info = new HashMap<>();
            info.put("fileName", file.getOriginalFilename());
            info.put("fileSize", file.getSize());
            info.put("contentType", file.getContentType());
            results.add(info);
        }
        return Result.success(results);
    }

    @Operation(summary = "上传文件和表单数据", description = "同时上传文件和提交表单数据")
    @PostMapping(value = "/upload-with-data", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, Object>> uploadWithData(
            @Parameter(description = "文件", required = true)
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "用户名") @RequestParam String username,
            @Parameter(description = "邮箱") @RequestParam(required = false) String email,
            @Parameter(description = "是否公开") @RequestParam(defaultValue = "false") Boolean isPublic) {
        Map<String, Object> result = new HashMap<>();
        result.put("fileName", file.getOriginalFilename());
        result.put("fileSize", file.getSize());
        result.put("username", username);
        result.put("email", email);
        result.put("isPublic", isPublic);
        return Result.success(result);
    }
}
