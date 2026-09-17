package com.vanmoc.admin;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {
    private final JdbcTemplate jdbcTemplate;

    public AdminProductController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<AdminProductDto> listProducts() {
        return jdbcTemplate.query(
                """
                SELECT p.id, p.sku, p.name, p.slug, p.description, p.short_description, p.material,
                       p.origin, p.price, p.stock_quantity, p.status, p.is_personalizable,
                       c.name AS category_name, c.slug AS category_slug,
                       COALESCE((
                           SELECT pi.image_url
                           FROM product_images pi
                           WHERE pi.product_id = p.id
                           ORDER BY CASE WHEN pi.type = 'MAIN' THEN 0 ELSE 1 END, pi.sort_order
                           LIMIT 1
                       ), c.image_url) AS image_url
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                ORDER BY p.updated_at DESC, p.created_at DESC
                """,
                this::mapProduct);
    }

    @PostMapping
    @Transactional
    public Map<String, Object> createProduct(@RequestBody ProductMutationRequest request) {
        Long categoryId = categoryId(request.categorySlug());
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO products
                        (category_id, sku, name, slug, description, short_description, material,
                         origin, price, stock_quantity, status, is_personalizable)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    new String[] {"id"});
            ps.setLong(1, categoryId);
            ps.setString(2, request.sku());
            ps.setString(3, request.name());
            ps.setString(4, request.slug());
            ps.setString(5, request.description());
            ps.setString(6, request.shortDescription());
            ps.setString(7, request.material());
            ps.setString(8, request.origin());
            ps.setBigDecimal(9, request.price());
            ps.setInt(10, request.stockQuantity());
            ps.setString(11, request.status() == null ? "DRAFT" : request.status());
            ps.setBoolean(12, request.personalizable());
            return ps;
        }, keyHolder);

        Long productId = keyHolder.getKey().longValue();
        replaceProductImages(productId, request);

        return Map.of("id", productId, "slug", request.slug(), "status", "CREATED");
    }

    @PutMapping("/{slug}")
    @Transactional
    public Map<String, String> updateProduct(@PathVariable String slug, @RequestBody ProductMutationRequest request) {
        Long productId = jdbcTemplate.queryForObject("SELECT id FROM products WHERE slug = ?", Long.class, slug);
        Long categoryId = categoryId(request.categorySlug());

        jdbcTemplate.update(
                """
                UPDATE products
                SET category_id = ?, sku = ?, name = ?, slug = ?, description = ?, short_description = ?, material = ?, origin = ?,
                    price = ?, stock_quantity = ?, status = ?, is_personalizable = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE slug = ?
                """,
                categoryId,
                request.sku(),
                request.name(),
                request.slug(),
                request.description(),
                request.shortDescription(),
                request.material(),
                request.origin(),
                request.price(),
                request.stockQuantity(),
                request.status() == null ? "DRAFT" : request.status(),
                request.personalizable(),
                slug);

        replaceProductImages(productId, request);

        return Map.of("slug", request.slug(), "status", "UPDATED");
    }

    @DeleteMapping("/{slug}")
    public Map<String, String> archiveProduct(@PathVariable String slug) {
        jdbcTemplate.update("UPDATE products SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE slug = ?", slug);
        return Map.of("slug", slug, "status", "INACTIVE");
    }

    private Long categoryId(String categorySlug) {
        return jdbcTemplate.queryForObject("SELECT id FROM categories WHERE slug = ?", Long.class, categorySlug);
    }

    private void replaceProductImages(Long productId, ProductMutationRequest request) {
        List<String> imageUrls = request.normalizedImageUrls();

        jdbcTemplate.update("DELETE FROM product_images WHERE product_id = ?", productId);

        for (int index = 0; index < imageUrls.size(); index++) {
            jdbcTemplate.update(
                    "INSERT INTO product_images (product_id, image_url, type, sort_order, alt_text) VALUES (?, ?, ?, ?, ?)",
                    productId,
                    imageUrls.get(index),
                    index == 0 ? "MAIN" : "GALLERY",
                    index + 1,
                    request.name());
        }
    }

    private List<String> imagesForProduct(Long productId) {
        return jdbcTemplate.queryForList(
                "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC",
                String.class,
                productId);
    }

    private AdminProductDto mapProduct(ResultSet rs, int rowNum) throws SQLException {
        return new AdminProductDto(
                rs.getLong("id"),
                rs.getString("sku"),
                rs.getString("name"),
                rs.getString("slug"),
                rs.getString("description"),
                rs.getString("short_description"),
                rs.getString("material"),
                rs.getString("origin"),
                rs.getBigDecimal("price"),
                rs.getInt("stock_quantity"),
                rs.getString("status"),
                rs.getBoolean("is_personalizable"),
                rs.getString("category_name"),
                rs.getString("category_slug"),
                rs.getString("image_url"),
                imagesForProduct(rs.getLong("id")));
    }

    public record ProductMutationRequest(
            String categorySlug,
            String sku,
            String name,
            String slug,
            String description,
            String shortDescription,
            String material,
            String origin,
            BigDecimal price,
            Integer stockQuantity,
            String status,
            Boolean personalizable,
            String imageUrl,
            List<String> imageUrls) {
        public Integer stockQuantity() {
            return stockQuantity == null ? 0 : stockQuantity;
        }

        public Boolean personalizable() {
            return personalizable != null && personalizable;
        }

        public List<String> normalizedImageUrls() {
            if (imageUrls != null && !imageUrls.isEmpty()) {
                return imageUrls.stream()
                        .filter(imageUrl -> imageUrl != null && !imageUrl.isBlank())
                        .map(String::trim)
                        .distinct()
                        .toList();
            }

            if (imageUrl != null && !imageUrl.isBlank()) {
                return List.of(imageUrl.trim());
            }

            return List.of();
        }
    }

    public record AdminProductDto(
            Long id,
            String sku,
            String name,
            String slug,
            String description,
            String shortDescription,
            String material,
            String origin,
            BigDecimal price,
            Integer stockQuantity,
            String status,
            Boolean personalizable,
            String categoryName,
            String categorySlug,
            String imageUrl,
            List<String> images) {
    }
}
