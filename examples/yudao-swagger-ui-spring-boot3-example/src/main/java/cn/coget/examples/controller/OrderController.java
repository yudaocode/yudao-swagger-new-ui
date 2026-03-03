package cn.coget.examples.controller;

import cn.coget.examples.dto.OrderCreateDTO;
import cn.coget.examples.dto.OrderQueryDTO;
import cn.coget.examples.vo.ErrorResponse;
import cn.coget.examples.vo.OrderVO;
import cn.coget.examples.vo.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Tag(name = "订单管理")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Operation(summary = "获取订单列表", description = "根据查询条件获取订单列表，支持分页")
    @GetMapping
    public Result<List<OrderVO>> getOrders(
            @Parameter(description = "查询条件") OrderQueryDTO query,
            @Parameter(description = "状态", in = ParameterIn.QUERY) @RequestParam(required = false) String status) {
        List<OrderVO> orders = new ArrayList<>();
        OrderVO order = new OrderVO();
        order.setId(1L);
        order.setOrderNo("ORD001");
        order.setUserId(1L);
        order.setAmount(new BigDecimal("100.00"));
        order.setCreateTime(LocalDateTime.now());
        orders.add(order);
        return Result.success(orders);
    }

    @Operation(summary = "获取订单详情", description = "根据订单ID获取订单详细信息")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功"),
            @ApiResponse(responseCode = "404", description = "订单不存在",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public Result<OrderVO> getOrderById(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id) {
        OrderVO order = new OrderVO();
        order.setId(id);
        order.setOrderNo("ORD001");
        order.setUserId(1L);
        order.setAmount(new BigDecimal("100.00"));
        order.setCreateTime(LocalDateTime.now());
        return Result.success(order);
    }

    @Operation(summary = "根据订单号查询", description = "根据订单号精确查询订单")
    @GetMapping("/by-no/{orderNo}")
    public Result<OrderVO> getOrderByNo(
            @Parameter(description = "订单号", required = true) @PathVariable String orderNo) {
        OrderVO order = new OrderVO();
        order.setId(1L);
        order.setOrderNo(orderNo);
        order.setUserId(1L);
        order.setAmount(new BigDecimal("100.00"));
        order.setCreateTime(LocalDateTime.now());
        return Result.success(order);
    }

    @Operation(summary = "创建订单", description = "创建新订单")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(responseCode = "400", description = "参数错误",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "未登录",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<Result<OrderVO>> createOrder(
            @org.springframework.web.bind.annotation.RequestBody OrderCreateDTO dto) {
        OrderVO order = new OrderVO();
        order.setId(1L);
        order.setOrderNo("ORD" + System.currentTimeMillis());
        order.setUserId(dto.getUserId());
        order.setAmount(BigDecimal.valueOf(7999.00));
        order.setCreateTime(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(Result.success(order));
    }

    @Operation(summary = "更新订单", description = "更新订单信息")
    @PutMapping("/{id}")
    public Result<OrderVO> updateOrder(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody OrderCreateDTO dto) {
        OrderVO order = new OrderVO();
        order.setId(id);
        order.setOrderNo("ORD001");
        order.setUserId(dto.getUserId());
        order.setAmount(BigDecimal.valueOf(7999.00));
        order.setCreateTime(LocalDateTime.now());
        return Result.success(order);
    }

    @Operation(summary = "取消订单", description = "取消指定订单")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "取消成功"),
            @ApiResponse(responseCode = "400", description = "订单状态不允许取消",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "订单不存在",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{id}/cancel")
    public Result<Boolean> cancelOrder(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id,
            @Parameter(description = "取消原因") @RequestParam(required = false) String reason) {
        return Result.success(true);
    }

    @Operation(summary = "支付订单", description = "支付指定订单")
    @PostMapping("/{id}/pay")
    public Result<String> payOrder(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id,
            @Parameter(description = "支付方式", required = true) @RequestParam String paymentMethod,
            @Parameter(description = "支付密码") @RequestParam(required = false) String payPassword) {
        return Result.success("PAY" + System.currentTimeMillis());
    }

    @Operation(summary = "确认收货", description = "确认订单收货")
    @PostMapping("/{id}/confirm")
    public Result<Boolean> confirmOrder(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id) {
        return Result.success(true);
    }

    @Operation(summary = "删除订单", description = "删除指定订单（软删除）")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "批量删除订单", description = "根据订单ID列表批量删除订单")
    @DeleteMapping("/batch")
    public Result<Integer> batchDeleteOrders(
            @org.springframework.web.bind.annotation.RequestBody List<Long> ids) {
        return Result.success(ids.size());
    }

    @Operation(summary = "获取用户订单列表", description = "获取指定用户的所有订单")
    @GetMapping("/user/{userId}")
    public Result<List<OrderVO>> getOrdersByUserId(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size) {
        List<OrderVO> orders = new ArrayList<>();
        OrderVO order = new OrderVO();
        order.setId(1L);
        order.setOrderNo("ORD001");
        order.setUserId(userId);
        order.setAmount(new BigDecimal("100.00"));
        order.setCreateTime(LocalDateTime.now());
        orders.add(order);
        return Result.success(orders);
    }

    @Operation(summary = "统计订单数量", description = "根据条件统计订单数量")
    @GetMapping("/count")
    public Result<Long> countOrders(
            @Parameter(description = "用户ID") @RequestParam(required = false) Long userId,
            @Parameter(description = "状态") @RequestParam(required = false) String status,
            @Parameter(description = "开始时间") @RequestParam(required = false) String startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) String endTime) {
        return Result.success(100L);
    }

    @Operation(summary = "导出订单", description = "导出订单数据")
    @GetMapping("/export")
    public ResponseEntity<String> exportOrders(
            @Parameter(description = "文件格式") @RequestParam(defaultValue = "xlsx") String format,
            @Parameter(description = "开始时间") @RequestParam(required = false) String startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) String endTime) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders." + format)
                .body("id,orderNo,userId,amount\n1,ORD001,1,100.00\n2,ORD002,2,200.00");
    }

    @Operation(summary = "修改订单备注", description = "修改订单的备注信息")
    @PatchMapping("/{id}/remark")
    public Result<Boolean> updateRemark(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id,
            @Parameter(description = "备注内容", required = true) @RequestParam String remark) {
        return Result.success(true);
    }

    @Operation(summary = "申请退款", description = "申请订单退款")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "申请成功"),
            @ApiResponse(responseCode = "400", description = "订单状态不允许退款",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{id}/refund")
    public Result<String> applyRefund(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id,
            @Parameter(description = "退款原因", required = true) @RequestParam String reason,
            @Parameter(description = "退款金额") @RequestParam(required = false) BigDecimal amount) {
        return Result.success("RF" + System.currentTimeMillis());
    }

    @Operation(summary = "获取订单物流信息", description = "获取订单的物流跟踪信息")
    @GetMapping("/{id}/logistics")
    public Result<List<String>> getOrderLogistics(
            @Parameter(description = "订单ID", required = true) @PathVariable Long id) {
        List<String> logistics = new ArrayList<>();
        logistics.add("2024-01-01 10:00:00 - 订单已提交");
        logistics.add("2024-01-01 12:00:00 - 商家已发货");
        logistics.add("2024-01-02 08:00:00 - 快递已揽收");
        logistics.add("2024-01-03 10:00:00 - 正在派送中");
        return Result.success(logistics);
    }

    @Operation(summary = "计算订单总价", description = "计算订单总价（不创建订单）")
    @PostMapping("/calculate")
    public Result<BigDecimal> calculateOrderPrice(
            @org.springframework.web.bind.annotation.RequestBody OrderCreateDTO dto) {
        BigDecimal total = BigDecimal.ZERO;
        if (dto.getItems() != null) {
            for (OrderCreateDTO.OrderItemDTO item : dto.getItems()) {
                if (item.getPrice() != null && item.getQuantity() != null) {
                    total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
        }
        return Result.success(total);
    }
}
