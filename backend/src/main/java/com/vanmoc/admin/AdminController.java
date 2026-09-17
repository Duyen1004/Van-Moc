package com.vanmoc.admin;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final JdbcTemplate jdbcTemplate;

    public AdminController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/dashboard")
    public DashboardDto dashboard() {
        Integer products = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM products", Integer.class);
        Integer orders = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders", Integer.class);
        Integer pendingOrders = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders WHERE order_status = 'PENDING'", Integer.class);
        Integer pendingReviews = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM product_reviews WHERE status = 'PENDING'", Integer.class);
        Integer traceCodes = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM trace_products", Integer.class);
        BigDecimal revenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status <> 'CANCELLED'",
                BigDecimal.class);

        List<RecentOrderDto> recentOrders = jdbcTemplate.query(
                """
                SELECT order_code, customer_name, total_amount, payment_status, order_status, created_at
                FROM orders
                ORDER BY created_at DESC
                LIMIT 8
                """,
                (rs, rowNum) -> new RecentOrderDto(
                        rs.getString("order_code"),
                        rs.getString("customer_name"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("payment_status"),
                        rs.getString("order_status"),
                        rs.getTimestamp("created_at").toInstant().toString()));

        return new DashboardDto(products, orders, pendingOrders, pendingReviews, traceCodes, revenue, recentOrders);
    }

    @GetMapping("/orders")
    public List<AdminOrderDto> orders() {
        return jdbcTemplate.query(
                """
                SELECT order_code, customer_name, phone, email, total_amount,
                       payment_method, payment_status, order_status, created_at
                FROM orders
                ORDER BY created_at DESC
                """,
                (rs, rowNum) -> new AdminOrderDto(
                        rs.getString("order_code"),
                        rs.getString("customer_name"),
                        rs.getString("phone"),
                        rs.getString("email"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("payment_method"),
                        rs.getString("payment_status"),
                        rs.getString("order_status"),
                        rs.getTimestamp("created_at").toInstant().toString()));
    }

    @PatchMapping("/orders/{code}/status")
    public Map<String, String> updateOrderStatus(@PathVariable String code, @RequestBody UpdateOrderStatusRequest request) {
        jdbcTemplate.update(
                """
                UPDATE orders
                SET order_status = COALESCE(?, order_status),
                    payment_status = COALESCE(?, payment_status),
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_code = ?
                """,
                request.orderStatus(),
                request.paymentStatus(),
                code);

        return Map.of("orderCode", code, "status", "UPDATED");
    }

    @GetMapping("/personalizations")
    public List<AdminPersonalizationDto> personalizations() {
        return jdbcTemplate.query(
                """
                SELECT oip.id, o.order_code, oi.product_name, o.customer_name, oip.content, oip.font,
                       oip.position, oip.engraving_price, o.order_status, oip.created_at
                FROM order_item_personalizations oip
                JOIN order_items oi ON oi.id = oip.order_item_id
                JOIN orders o ON o.id = oi.order_id
                ORDER BY oip.created_at DESC
                """,
                (rs, rowNum) -> new AdminPersonalizationDto(
                        rs.getLong("id"),
                        rs.getString("order_code"),
                        rs.getString("product_name"),
                        rs.getString("customer_name"),
                        rs.getString("content"),
                        rs.getString("font"),
                        rs.getString("position"),
                        rs.getBigDecimal("engraving_price"),
                        rs.getString("order_status"),
                        rs.getTimestamp("created_at").toInstant().toString()));
    }

    @GetMapping("/trace-products")
    public List<AdminTraceProductDto> traceProducts() {
        return jdbcTemplate.query(
                """
                SELECT tp.id, tp.trace_code, p.name AS product_name, p.slug AS product_slug,
                       pb.batch_code, tp.status, tp.qr_url, tp.created_at,
                       (SELECT COUNT(*) FROM trace_events te WHERE te.trace_product_id = tp.id) AS event_count
                FROM trace_products tp
                JOIN products p ON p.id = tp.product_id
                LEFT JOIN production_batches pb ON pb.id = tp.batch_id
                ORDER BY tp.created_at DESC
                """,
                (rs, rowNum) -> new AdminTraceProductDto(
                        rs.getLong("id"),
                        rs.getString("trace_code"),
                        rs.getString("product_name"),
                        rs.getString("product_slug"),
                        rs.getString("batch_code"),
                        rs.getString("status"),
                        rs.getString("qr_url"),
                        rs.getInt("event_count"),
                        rs.getTimestamp("created_at").toInstant().toString()));
    }

    @PatchMapping("/trace-products/{code}/status")
    public Map<String, String> updateTraceStatus(@PathVariable String code, @RequestBody UpdateTraceStatusRequest request) {
        jdbcTemplate.update(
                "UPDATE trace_products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE trace_code = ?",
                request.status(),
                code);

        return Map.of("traceCode", code, "status", "UPDATED");
    }

    @GetMapping("/reviews")
    public List<AdminReviewDto> reviews() {
        return jdbcTemplate.query(
                """
                SELECT pr.id, pr.customer_name, pr.rating, pr.title, pr.content, pr.status,
                       pr.created_at, p.name AS product_name
                FROM product_reviews pr
                JOIN products p ON p.id = pr.product_id
                ORDER BY pr.created_at DESC
                """,
                (rs, rowNum) -> new AdminReviewDto(
                        rs.getLong("id"),
                        rs.getString("customer_name"),
                        rs.getInt("rating"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getString("product_name"),
                        rs.getString("status"),
                        rs.getTimestamp("created_at").toInstant().toString()));
    }

    @PatchMapping("/reviews/{id}/status")
    public Map<String, Object> updateReviewStatus(@PathVariable Long id, @RequestBody UpdateReviewStatusRequest request) {
        jdbcTemplate.update(
                "UPDATE product_reviews SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                request.status(),
                id);

        return Map.of("id", id, "status", "UPDATED");
    }

    public record DashboardDto(
            Integer products,
            Integer orders,
            Integer pendingOrders,
            Integer pendingReviews,
            Integer traceCodes,
            BigDecimal revenue,
            List<RecentOrderDto> recentOrders) {
    }

    public record RecentOrderDto(
            String orderCode,
            String customerName,
            BigDecimal totalAmount,
            String paymentStatus,
            String orderStatus,
            String createdAt) {
    }

    public record AdminOrderDto(
            String orderCode,
            String customerName,
            String phone,
            String email,
            BigDecimal totalAmount,
            String paymentMethod,
            String paymentStatus,
            String orderStatus,
            String createdAt) {
    }

    public record UpdateOrderStatusRequest(String orderStatus, String paymentStatus) {
    }

    public record AdminPersonalizationDto(
            Long id,
            String orderCode,
            String productName,
            String customerName,
            String content,
            String font,
            String position,
            BigDecimal engravingPrice,
            String orderStatus,
            String createdAt) {
    }

    public record AdminTraceProductDto(
            Long id,
            String traceCode,
            String productName,
            String productSlug,
            String batchCode,
            String status,
            String qrUrl,
            Integer eventCount,
            String createdAt) {
    }

    public record UpdateTraceStatusRequest(String status) {
    }

    public record AdminReviewDto(
            Long id,
            String customerName,
            Integer rating,
            String title,
            String content,
            String productName,
            String status,
            String createdAt) {
    }

    public record UpdateReviewStatusRequest(String status) {
    }
}
