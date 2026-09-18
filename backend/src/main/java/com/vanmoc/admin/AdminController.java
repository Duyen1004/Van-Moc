package com.vanmoc.admin;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping("/trace-products/{code}")
    public TraceMutationDto traceProduct(@PathVariable String code) {
        return jdbcTemplate.queryForObject(
                """
                SELECT tp.trace_code, tp.qr_url, tp.status, p.slug AS product_slug, pb.batch_code
                FROM trace_products tp
                JOIN products p ON p.id = tp.product_id
                LEFT JOIN production_batches pb ON pb.id = tp.batch_id
                WHERE tp.trace_code = ?
                """,
                (rs, rowNum) -> new TraceMutationDto(
                        rs.getString("trace_code"),
                        rs.getString("product_slug"),
                        rs.getString("batch_code"),
                        rs.getString("status"),
                        rs.getString("qr_url"),
                        traceEventsForCode(code)),
                code);
    }

    @PostMapping("/trace-products")
    @Transactional
    public Map<String, String> createTraceProduct(@RequestBody TraceMutationDto request) {
        Long productId = productId(request.productSlug());
        Long batchId = batchId(request.batchCode());
        String qrUrl = request.qrUrl() == null || request.qrUrl().isBlank()
                ? "/trace/" + request.traceCode()
                : request.qrUrl();

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO trace_products (trace_code, product_id, batch_id, status, qr_url)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    new String[] {"id"});
            ps.setString(1, request.traceCode());
            ps.setLong(2, productId);
            if (batchId == null) ps.setObject(3, null); else ps.setLong(3, batchId);
            ps.setString(4, request.status() == null ? "ACTIVE" : request.status());
            ps.setString(5, qrUrl);
            return ps;
        }, keyHolder);

        replaceTraceEvents(keyHolder.getKey().longValue(), request.events());
        return Map.of("traceCode", request.traceCode(), "status", "CREATED");
    }

    @PutMapping("/trace-products/{code}")
    @Transactional
    public Map<String, String> updateTraceProduct(@PathVariable String code, @RequestBody TraceMutationDto request) {
        Long traceId = traceId(code);
        Long productId = productId(request.productSlug());
        Long batchId = batchId(request.batchCode());
        String nextCode = request.traceCode() == null || request.traceCode().isBlank() ? code : request.traceCode();
        String qrUrl = request.qrUrl() == null || request.qrUrl().isBlank()
                ? "/trace/" + nextCode
                : request.qrUrl();

        jdbcTemplate.update(
                """
                UPDATE trace_products
                SET trace_code = ?, product_id = ?, batch_id = ?, status = ?, qr_url = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                nextCode,
                productId,
                batchId,
                request.status() == null ? "ACTIVE" : request.status(),
                qrUrl,
                traceId);
        replaceTraceEvents(traceId, request.events());
        return Map.of("traceCode", nextCode, "status", "UPDATED");
    }

    @DeleteMapping("/trace-products/{code}")
    public Map<String, String> archiveTraceProduct(@PathVariable String code) {
        jdbcTemplate.update("UPDATE trace_products SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE trace_code = ?", code);
        return Map.of("traceCode", code, "status", "ARCHIVED");
    }

    @GetMapping("/categories")
    public List<CategoryAdminDto> adminCategories() {
        return jdbcTemplate.query(
                "SELECT id, name, slug, description, image_url, status FROM categories ORDER BY id ASC",
                (rs, rowNum) -> new CategoryAdminDto(rs.getLong("id"), rs.getString("name"), rs.getString("slug"), rs.getString("description"), rs.getString("image_url"), rs.getString("status")));
    }

    @PostMapping("/categories")
    public Map<String, Object> createCategory(@RequestBody CategoryAdminDto request) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO categories (name, slug, description, image_url, status) VALUES (?, ?, ?, ?, ?)",
                    new String[] {"id"});
            ps.setString(1, request.name());
            ps.setString(2, request.slug());
            ps.setString(3, request.description());
            ps.setString(4, request.imageUrl());
            ps.setString(5, request.status() == null ? "ACTIVE" : request.status());
            return ps;
        }, keyHolder);
        return Map.of("id", keyHolder.getKey().longValue(), "status", "CREATED");
    }

    @PutMapping("/categories/{id}")
    public Map<String, Object> updateCategory(@PathVariable Long id, @RequestBody CategoryAdminDto request) {
        jdbcTemplate.update(
                "UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                request.name(), request.slug(), request.description(), request.imageUrl(), request.status() == null ? "ACTIVE" : request.status(), id);
        return Map.of("id", id, "status", "UPDATED");
    }

    @DeleteMapping("/categories/{id}")
    public Map<String, Object> deleteCategory(@PathVariable Long id) {
        jdbcTemplate.update("UPDATE categories SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
        return Map.of("id", id, "status", "INACTIVE");
    }

    @GetMapping("/banners")
    public List<BannerAdminDto> banners() {
        return jdbcTemplate.query(
                "SELECT id, title, subtitle, image_url, link_url, position, status, sort_order FROM banners ORDER BY sort_order ASC, id DESC",
                (rs, rowNum) -> new BannerAdminDto(rs.getLong("id"), rs.getString("title"), rs.getString("subtitle"), rs.getString("image_url"), rs.getString("link_url"), rs.getString("position"), rs.getString("status"), rs.getInt("sort_order")));
    }

    @PostMapping("/banners")
    public Map<String, Object> createBanner(@RequestBody BannerAdminDto request) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO banners (title, subtitle, image_url, link_url, position, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    new String[] {"id"});
            ps.setString(1, request.title());
            ps.setString(2, request.subtitle());
            ps.setString(3, request.imageUrl());
            ps.setString(4, request.linkUrl());
            ps.setString(5, request.position() == null ? "HOME" : request.position());
            ps.setString(6, request.status() == null ? "ACTIVE" : request.status());
            ps.setInt(7, request.sortOrder() == null ? 0 : request.sortOrder());
            return ps;
        }, keyHolder);
        return Map.of("id", keyHolder.getKey().longValue(), "status", "CREATED");
    }

    @PutMapping("/banners/{id}")
    public Map<String, Object> updateBanner(@PathVariable Long id, @RequestBody BannerAdminDto request) {
        jdbcTemplate.update(
                "UPDATE banners SET title = ?, subtitle = ?, image_url = ?, link_url = ?, position = ?, status = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                request.title(), request.subtitle(), request.imageUrl(), request.linkUrl(), request.position(), request.status(), request.sortOrder() == null ? 0 : request.sortOrder(), id);
        return Map.of("id", id, "status", "UPDATED");
    }

    @DeleteMapping("/banners/{id}")
    public Map<String, Object> deleteBanner(@PathVariable Long id) {
        jdbcTemplate.update("UPDATE banners SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
        return Map.of("id", id, "status", "INACTIVE");
    }

    @GetMapping("/contents")
    public List<ContentAdminDto> contents() {
        return jdbcTemplate.query(
                "SELECT id, title, slug, type, summary, body, cover_image_url, status FROM contents ORDER BY updated_at DESC, id DESC",
                (rs, rowNum) -> new ContentAdminDto(rs.getLong("id"), rs.getString("title"), rs.getString("slug"), rs.getString("type"), rs.getString("summary"), rs.getString("body"), rs.getString("cover_image_url"), rs.getString("status")));
    }

    @PostMapping("/contents")
    public Map<String, Object> createContent(@RequestBody ContentAdminDto request) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO contents (title, slug, type, summary, body, cover_image_url, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
                    new String[] {"id"});
            ps.setString(1, request.title());
            ps.setString(2, request.slug());
            ps.setString(3, request.type() == null ? "PAGE" : request.type());
            ps.setString(4, request.summary());
            ps.setString(5, request.body());
            ps.setString(6, request.coverImageUrl());
            ps.setString(7, request.status() == null ? "DRAFT" : request.status());
            return ps;
        }, keyHolder);
        return Map.of("id", keyHolder.getKey().longValue(), "status", "CREATED");
    }

    @PutMapping("/contents/{id}")
    public Map<String, Object> updateContent(@PathVariable Long id, @RequestBody ContentAdminDto request) {
        jdbcTemplate.update(
                "UPDATE contents SET title = ?, slug = ?, type = ?, summary = ?, body = ?, cover_image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                request.title(), request.slug(), request.type(), request.summary(), request.body(), request.coverImageUrl(), request.status(), id);
        return Map.of("id", id, "status", "UPDATED");
    }

    @DeleteMapping("/contents/{id}")
    public Map<String, Object> deleteContent(@PathVariable Long id) {
        jdbcTemplate.update("UPDATE contents SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
        return Map.of("id", id, "status", "ARCHIVED");
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

    public record TraceMutationDto(
            String traceCode,
            String productSlug,
            String batchCode,
            String status,
            String qrUrl,
            List<TraceEventMutationDto> events) {
    }

    public record TraceEventMutationDto(
            String eventType,
            String title,
            String description,
            String eventDate,
            String imageUrl,
            String videoUrl) {
    }

    public record CategoryAdminDto(Long id, String name, String slug, String description, String imageUrl, String status) {
    }

    public record BannerAdminDto(Long id, String title, String subtitle, String imageUrl, String linkUrl, String position, String status, Integer sortOrder) {
    }

    public record ContentAdminDto(Long id, String title, String slug, String type, String summary, String body, String coverImageUrl, String status) {
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

    private Long productId(String slug) {
        List<Long> ids = jdbcTemplate.queryForList("SELECT id FROM products WHERE slug = ?", Long.class, slug);
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return ids.get(0);
    }

    private Long batchId(String batchCode) {
        if (batchCode == null || batchCode.isBlank()) {
            return null;
        }
        List<Long> ids = jdbcTemplate.queryForList("SELECT id FROM production_batches WHERE batch_code = ?", Long.class, batchCode);
        return ids.isEmpty() ? null : ids.get(0);
    }

    private Long traceId(String code) {
        List<Long> ids = jdbcTemplate.queryForList("SELECT id FROM trace_products WHERE trace_code = ?", Long.class, code);
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trace product not found");
        }
        return ids.get(0);
    }

    private List<TraceEventMutationDto> traceEventsForCode(String code) {
        return jdbcTemplate.query(
                """
                SELECT te.event_type, te.title, te.description, te.event_date, te.image_url, te.video_url
                FROM trace_events te
                JOIN trace_products tp ON tp.id = te.trace_product_id
                WHERE tp.trace_code = ?
                ORDER BY te.sort_order ASC
                """,
                (rs, rowNum) -> new TraceEventMutationDto(
                        rs.getString("event_type"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("event_date"),
                        rs.getString("image_url"),
                        rs.getString("video_url")),
                code);
    }

    private void replaceTraceEvents(Long traceProductId, List<TraceEventMutationDto> events) {
        jdbcTemplate.update("DELETE FROM trace_events WHERE trace_product_id = ?", traceProductId);
        if (events == null) {
            return;
        }

        for (int index = 0; index < events.size(); index++) {
            TraceEventMutationDto event = events.get(index);
            if (event.title() == null || event.title().isBlank()) {
                continue;
            }
            jdbcTemplate.update(
                    """
                    INSERT INTO trace_events
                        (trace_product_id, event_type, title, description, event_date, image_url, video_url, sort_order)
                    VALUES (?, ?, ?, ?, CAST(NULLIF(?, '') AS DATE), ?, ?, ?)
                    """,
                    traceProductId,
                    event.eventType() == null ? "STEP" : event.eventType(),
                    event.title(),
                    event.description(),
                    event.eventDate(),
                    event.imageUrl(),
                    event.videoUrl(),
                    index + 1);
        }
    }
}
