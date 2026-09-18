package com.vanmoc.product;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final JdbcTemplate jdbcTemplate;

    public ProductController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<ProductSummary> listProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, name = "q") String query) {
        StringBuilder sql = new StringBuilder(PRODUCT_SUMMARY_SQL).append(" WHERE p.status <> 'INACTIVE'");
        List<Object> params = new ArrayList<>();

        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
            sql.append(" AND c.slug = ?");
            params.add(category);
        }

        if (query != null && !query.isBlank()) {
            String keyword = "%" + query.trim().toLowerCase() + "%";
            sql.append("""
                    AND (
                        LOWER(p.name) LIKE ?
                        OR LOWER(p.sku) LIKE ?
                        OR LOWER(p.slug) LIKE ?
                        OR LOWER(COALESCE(p.material, '')) LIKE ?
                        OR LOWER(COALESCE(p.short_description, '')) LIKE ?
                        OR LOWER(COALESCE(p.description, '')) LIKE ?
                        OR LOWER(COALESCE(c.name, '')) LIKE ?
                    )
                    """);
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        sql.append(" ORDER BY p.created_at DESC");

        return jdbcTemplate.query(sql.toString(), this::mapProductSummary, params.toArray());
    }

    @GetMapping("/{slug}")
    public ProductDetail getProduct(@PathVariable String slug) {
        ProductDetail product = jdbcTemplate.queryForObject(
                """
                SELECT p.id, p.sku, p.name, p.slug, p.description, p.short_description, p.material,
                       p.origin, p.price, p.stock_quantity, p.status, p.is_personalizable,
                       c.name AS category_name, c.slug AS category_slug,
                       COALESCE(po.max_characters, 0) AS max_characters,
                       COALESCE(po.engraving_price, 0) AS engraving_price,
                       po.default_font
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                LEFT JOIN personalization_options po ON po.product_id = p.id
                WHERE p.slug = ?
                """,
                (rs, rowNum) -> new ProductDetail(
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
                        rs.getInt("max_characters"),
                        rs.getBigDecimal("engraving_price"),
                        rs.getString("default_font"),
                        imagesForProduct(rs.getLong("id"))),
                slug);

        return product;
    }

    private List<String> imagesForProduct(Long productId) {
        return jdbcTemplate.queryForList(
                "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC",
                String.class,
                productId);
    }

    private ProductSummary mapProductSummary(ResultSet rs, int rowNum) throws SQLException {
        return new ProductSummary(
                rs.getLong("id"),
                rs.getString("sku"),
                rs.getString("name"),
                rs.getString("slug"),
                rs.getString("category_name"),
                rs.getString("category_slug"),
                rs.getBigDecimal("price"),
                rs.getInt("stock_quantity"),
                rs.getString("status"),
                rs.getBoolean("is_personalizable"),
                rs.getString("image_url"));
    }

    private static final String PRODUCT_SUMMARY_SQL = """
            SELECT p.id, p.sku, p.name, p.slug, c.name AS category_name, c.slug AS category_slug,
                   p.price, p.stock_quantity, p.status, p.is_personalizable,
                   COALESCE((
                       SELECT pi.image_url
                       FROM product_images pi
                       WHERE pi.product_id = p.id
                       ORDER BY CASE WHEN pi.type = 'MAIN' THEN 0 ELSE 1 END, pi.sort_order
                       LIMIT 1
                   ), c.image_url) AS image_url
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            """;

    public record ProductSummary(
            Long id,
            String sku,
            String name,
            String slug,
            String categoryName,
            String categorySlug,
            BigDecimal price,
            Integer stockQuantity,
            String status,
            Boolean personalizable,
            String imageUrl) {
    }

    public record ProductDetail(
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
            Integer maxCharacters,
            BigDecimal engravingPrice,
            String defaultFont,
            List<String> images) {
    }
}
