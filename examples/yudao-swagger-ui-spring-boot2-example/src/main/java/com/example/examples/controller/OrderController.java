package com.example.examples.controller;

import com.example.examples.dto.OrderQueryDTO;
import com.example.examples.vo.OrderVO;
import com.example.examples.vo.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Tag(name = "订单管理")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Operation(summary = "获取订单列表")
    @GetMapping
    public Result<List<OrderVO>> getOrders(OrderQueryDTO query) {
        List<OrderVO> orders = new ArrayList<>();
        OrderVO order = new OrderVO();
        order.setId(1L);
        order.setOrderNo("ORD001");
        order.setUserId(1L);
        order.setAmount(new BigDecimal("100.00"));
        order.setCreateTime(new Date());
        orders.add(order);
        return Result.success(orders);
    }

    @Operation(summary = "获取订单详情")
    @GetMapping("/{id}")
    public Result<OrderVO> getOrderById(@PathVariable Long id) {
        OrderVO order = new OrderVO();
        order.setId(id);
        order.setOrderNo("ORD001");
        order.setUserId(1L);
        order.setAmount(new BigDecimal("100.00"));
        order.setCreateTime(new Date());
        return Result.success(order);
    }
}