package com.example.examples.controller;

import com.example.examples.dto.UserQueryDTO;
import com.example.examples.vo.Result;
import com.example.examples.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Tag(name = "用户管理")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Operation(summary = "获取用户列表")
    @GetMapping
    public Result<List<UserVO>> getUsers(UserQueryDTO query) {
        List<UserVO> users = new ArrayList<>();
        UserVO user = new UserVO();
        user.setId(1L);
        user.setUsername("admin");
        user.setEmail("admin@example.com");
        users.add(user);
        return Result.success(users);
    }

    @Operation(summary = "获取用户详情")
    @GetMapping("/{id}")
    public Result<UserVO> getUserInfo(@PathVariable Long id) {
        UserVO user = new UserVO();
        user.setId(id);
        user.setUsername("admin");
        user.setEmail("admin@example.com");
        return Result.success(user);
    }
}