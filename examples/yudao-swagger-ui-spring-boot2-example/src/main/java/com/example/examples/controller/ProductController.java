package com.example.examples.controller;

import com.example.examples.dto.ProductDTO;
import com.example.examples.vo.ErrorResponse;
import com.example.examples.vo.PageResult;
import com.example.examples.vo.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Tag(name = "商品管理")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Operation(summary = "获取商品列表（分页）", description = "分页获取商品列表")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PageResult.class)))
    })
    @GetMapping
    public PageResult<ProductDTO> getProducts(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "商品名称") @RequestParam(required = false) String name,
            @Parameter(description = "分类ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "最低价格") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "最高价格") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {

        List<ProductDTO> products = new ArrayList<>();
        ProductDTO product = new ProductDTO();
        product.setId(1L);
        product.setName("iPhone 15");
        product.setDescription("Apple iPhone 15 Pro Max");
        product.setPrice(new BigDecimal("9999.00"));
        product.setStock(100);
        product.setCategoryId(1L);
        product.setStatus(1);
        products.add(product);

        return PageResult.of(products, 100L, pageNum, pageSize);
    }

    @Operation(summary = "获取商品详情", description = "根据商品ID获取详细信息")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功"),
            @ApiResponse(responseCode = "404", description = "商品不存在",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public Result<ProductDTO> getProductById(
            @Parameter(description = "商品ID", required = true) @PathVariable Long id) {
        ProductDTO product = new ProductDTO();
        product.setId(id);
        product.setName("iPhone 15");
        product.setDescription("Apple iPhone 15 Pro Max");
        product.setPrice(new BigDecimal("9999.00"));
        product.setStock(100);
        product.setCategoryId(1L);
        product.setStatus(1);
        return Result.success(product);
    }

    @Operation(summary = "创建商品", description = "创建新商品")
    @PostMapping
    public ResponseEntity<Result<ProductDTO>> createProduct(
            @org.springframework.web.bind.annotation.RequestBody ProductDTO dto) {
        dto.setId(1L);
        return ResponseEntity.status(HttpStatus.CREATED).body(Result.success(dto));
    }

    @Operation(summary = "更新商品", description = "更新商品信息")
    @PutMapping("/{id}")
    public Result<ProductDTO> updateProduct(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody ProductDTO dto) {
        dto.setId(id);
        return Result.success(dto);
    }

    @Operation(summary = "删除商品", description = "删除商品")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "批量上架", description = "批量上架商品")
    @PostMapping("/batch/online")
    public Result<Integer> batchOnline(
            @org.springframework.web.bind.annotation.RequestBody List<Long> ids) {
        return Result.success(ids.size());
    }

    @Operation(summary = "批量下架", description = "批量下架商品")
    @PostMapping("/batch/offline")
    public Result<Integer> batchOffline(
            @org.springframework.web.bind.annotation.RequestBody List<Long> ids) {
        return Result.success(ids.size());
    }

    @Operation(summary = "搜索商品", description = "根据关键字搜索商品")
    @GetMapping("/search")
    public Result<List<ProductDTO>> searchProducts(
            @Parameter(description = "关键字", required = true) @RequestParam String keyword,
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "10") Integer limit) {

        List<ProductDTO> products = new ArrayList<>();
        ProductDTO product = new ProductDTO();
        product.setId(1L);
        product.setName(keyword + " - 相关商品");
        product.setPrice(new BigDecimal("99.00"));
        products.add(product);

        return Result.success(products);
    }

    @Operation(summary = "获取热门商品", description = "获取热门商品列表")
    @GetMapping("/hot")
    public Result<List<ProductDTO>> getHotProducts(
            @Parameter(description = "数量限制") @RequestParam(defaultValue = "10") Integer limit) {

        List<ProductDTO> products = new ArrayList<>();
        for (int i = 1; i <= limit && i <= 10; i++) {
            ProductDTO product = new ProductDTO();
            product.setId((long) i);
            product.setName("热门商品" + i);
            product.setPrice(new BigDecimal("99.00"));
            products.add(product);
        }

        return Result.success(products);
    }

    @Operation(summary = "更新库存", description = "更新商品库存")
    @PatchMapping("/{id}/stock")
    public Result<Boolean> updateStock(
            @PathVariable Long id,
            @Parameter(description = "库存变化量（正数增加，负数减少）") @RequestParam Integer quantity) {
        return Result.success(true);
    }

    @Operation(summary = "检查库存", description = "检查商品库存是否充足")
    @GetMapping("/{id}/check-stock")
    public Result<Boolean> checkStock(
            @PathVariable Long id,
            @Parameter(description = "所需数量") @RequestParam(defaultValue = "1") Integer quantity) {
        return Result.success(true);
    }
}
