package com.vanmoc.order;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final BigDecimal DEFAULT_SHIPPING_FEE = BigDecimal.valueOf(30000);
    private final JdbcTemplate jdbcTemplate;

    public OrderController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping
    @Transactional
    public OrderDto createOrder(@RequestBody CreateOrderRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must have at least one item");
        }

        String orderCode = "VM" + Instant.now().toEpochMilli();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal personalizationFee = BigDecimal.ZERO;

        for (OrderItemRequest item : request.items()) {
            ProductSnapshot product = productSnapshot(item.productSlug());
            int quantity = Math.max(item.quantity(), 1);
            subtotal = subtotal.add(product.price().multiply(BigDecimal.valueOf(quantity)));
            if (item.personalization() != null && item.personalization().engravingPrice() != null) {
                personalizationFee = personalizationFee.add(item.personalization().engravingPrice());
            }
        }

        BigDecimal total = subtotal.add(personalizationFee).add(DEFAULT_SHIPPING_FEE);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        BigDecimal finalSubtotal = subtotal;
        BigDecimal finalPersonalizationFee = personalizationFee;
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO orders
                        (order_code, customer_name, phone, email, address, province, note,
                         subtotal, shipping_fee, personalization_fee, total_amount, payment_method)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    new String[] {"id"});
            ps.setString(1, orderCode);
            ps.setString(2, request.customerName());
            ps.setString(3, request.phone());
            ps.setString(4, request.email());
            ps.setString(5, request.address());
            ps.setString(6, request.province());
            ps.setString(7, request.note());
            ps.setBigDecimal(8, finalSubtotal);
            ps.setBigDecimal(9, DEFAULT_SHIPPING_FEE);
            ps.setBigDecimal(10, finalPersonalizationFee);
            ps.setBigDecimal(11, total);
            ps.setString(12, request.paymentMethod() == null ? "COD" : request.paymentMethod());
            return ps;
        }, keyHolder);

        Long orderId = keyHolder.getKey().longValue();
        for (OrderItemRequest item : request.items()) {
            insertOrderItem(orderId, item);
        }

        return getOrder(orderCode);
    }

    @GetMapping("/{code}")
    public OrderDto getOrder(@PathVariable String code) {
        List<OrderDto> orders = jdbcTemplate.query(
                """
                SELECT id, order_code, customer_name, phone, email, address, province, note,
                       subtotal, shipping_fee, personalization_fee, total_amount,
                       payment_method, payment_status, order_status, created_at
                FROM orders
                WHERE order_code = ?
                """,
                (rs, rowNum) -> new OrderDto(
                        rs.getLong("id"),
                        rs.getString("order_code"),
                        rs.getString("customer_name"),
                        rs.getString("phone"),
                        rs.getString("email"),
                        rs.getString("address"),
                        rs.getString("province"),
                        rs.getString("note"),
                        rs.getBigDecimal("subtotal"),
                        rs.getBigDecimal("shipping_fee"),
                        rs.getBigDecimal("personalization_fee"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("payment_method"),
                        rs.getString("payment_status"),
                        rs.getString("order_status"),
                        rs.getTimestamp("created_at").toInstant().toString(),
                        orderItems(rs.getLong("id"))),
                code);

        if (orders.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return orders.get(0);
    }

    private void insertOrderItem(Long orderId, OrderItemRequest item) {
        ProductSnapshot product = productSnapshot(item.productSlug());
        int quantity = Math.max(item.quantity(), 1);
        BigDecimal subtotal = product.price().multiply(BigDecimal.valueOf(quantity));

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    new String[] {"id"});
            ps.setLong(1, orderId);
            ps.setLong(2, product.id());
            ps.setString(3, product.name());
            ps.setString(4, product.sku());
            ps.setInt(5, quantity);
            ps.setBigDecimal(6, product.price());
            ps.setBigDecimal(7, subtotal);
            return ps;
        }, keyHolder);

        Long orderItemId = keyHolder.getKey().longValue();
        if (item.personalization() != null && !item.personalization().content().isBlank()) {
            jdbcTemplate.update(
                    """
                    INSERT INTO order_item_personalizations
                        (order_item_id, content, font, position, preview_image_url, engraving_price)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    orderItemId,
                    item.personalization().content(),
                    item.personalization().font(),
                    item.personalization().position(),
                    item.personalization().previewImageUrl(),
                    item.personalization().engravingPrice() == null ? BigDecimal.ZERO : item.personalization().engravingPrice());
        }
    }

    private ProductSnapshot productSnapshot(String slug) {
        List<ProductSnapshot> products = jdbcTemplate.query(
                "SELECT id, sku, name, price FROM products WHERE slug = ? AND status = 'AVAILABLE'",
                (rs, rowNum) -> new ProductSnapshot(
                        rs.getLong("id"),
                        rs.getString("sku"),
                        rs.getString("name"),
                        rs.getBigDecimal("price")),
                slug);
        if (products.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return products.get(0);
    }

    private List<OrderItemDto> orderItems(Long orderId) {
        return jdbcTemplate.query(
                """
                SELECT oi.id, oi.product_name, oi.product_sku, oi.quantity, oi.unit_price, oi.subtotal,
                       oip.content, oip.font, oip.position, COALESCE(oip.engraving_price, 0) AS engraving_price
                FROM order_items oi
                LEFT JOIN order_item_personalizations oip ON oip.order_item_id = oi.id
                WHERE oi.order_id = ?
                ORDER BY oi.id ASC
                """,
                (rs, rowNum) -> new OrderItemDto(
                        rs.getLong("id"),
                        rs.getString("product_name"),
                        rs.getString("product_sku"),
                        rs.getInt("quantity"),
                        rs.getBigDecimal("unit_price"),
                        rs.getBigDecimal("subtotal"),
                        rs.getString("content"),
                        rs.getString("font"),
                        rs.getString("position"),
                        rs.getBigDecimal("engraving_price")),
                orderId);
    }

    private record ProductSnapshot(Long id, String sku, String name, BigDecimal price) {
    }

    public record CreateOrderRequest(
            String customerName,
            String phone,
            String email,
            String address,
            String province,
            String note,
            String paymentMethod,
            List<OrderItemRequest> items) {
    }

    public record OrderItemRequest(String productSlug, int quantity, PersonalizationRequest personalization) {
    }

    public record PersonalizationRequest(
            String content,
            String font,
            String position,
            String previewImageUrl,
            BigDecimal engravingPrice) {
    }

    public record OrderDto(
            Long id,
            String orderCode,
            String customerName,
            String phone,
            String email,
            String address,
            String province,
            String note,
            BigDecimal subtotal,
            BigDecimal shippingFee,
            BigDecimal personalizationFee,
            BigDecimal totalAmount,
            String paymentMethod,
            String paymentStatus,
            String orderStatus,
            String createdAt,
            List<OrderItemDto> items) {
    }

    public record OrderItemDto(
            Long id,
            String productName,
            String productSku,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal,
            String engravingContent,
            String engravingFont,
            String engravingPosition,
            BigDecimal engravingPrice) {
    }
}
