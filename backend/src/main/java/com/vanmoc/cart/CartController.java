package com.vanmoc.cart;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final JdbcTemplate jdbcTemplate;

    public CartController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public CartDto getCart(@RequestParam String sessionId) {
        Long cartId = findOrCreateCart(sessionId);
        return cartDto(cartId);
    }

    @PostMapping("/items")
    @Transactional
    public CartDto addItem(@RequestBody AddCartItemRequest request) {
        Long cartId = findOrCreateCart(request.sessionId());
        ProductPrice product = productPrice(request.productSlug());
        int quantity = Math.max(request.quantity(), 1);
        BigDecimal subtotal = product.price().multiply(BigDecimal.valueOf(quantity));

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    """
                    INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    new String[] {"id"});
            ps.setLong(1, cartId);
            ps.setLong(2, product.id());
            ps.setInt(3, quantity);
            ps.setBigDecimal(4, product.price());
            ps.setBigDecimal(5, subtotal);
            return ps;
        }, keyHolder);

        Long cartItemId = keyHolder.getKey().longValue();
        if (request.personalization() != null && !request.personalization().content().isBlank()) {
            jdbcTemplate.update(
                    """
                    INSERT INTO cart_item_personalizations
                        (cart_item_id, content, font, position, preview_image_url, engraving_price)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    cartItemId,
                    request.personalization().content(),
                    request.personalization().font(),
                    request.personalization().position(),
                    request.personalization().previewImageUrl(),
                    request.personalization().engravingPrice() == null ? BigDecimal.ZERO : request.personalization().engravingPrice());
        }

        return cartDto(cartId);
    }

    @PutMapping("/items/{itemId}")
    @Transactional
    public CartDto updateQuantity(@PathVariable Long itemId, @RequestBody UpdateCartItemRequest request) {
        int quantity = Math.max(request.quantity(), 1);
        Long cartId = cartIdForItem(itemId);
        jdbcTemplate.update(
                "UPDATE cart_items SET quantity = ?, subtotal = unit_price * ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                quantity,
                quantity,
                itemId);
        return cartDto(cartId);
    }

    @DeleteMapping("/items/{itemId}")
    @Transactional
    public CartDto removeItem(@PathVariable Long itemId) {
        Long cartId = cartIdForItem(itemId);
        jdbcTemplate.update("DELETE FROM cart_items WHERE id = ?", itemId);
        return cartDto(cartId);
    }

    private Long findOrCreateCart(String sessionId) {
        List<Long> ids = jdbcTemplate.queryForList(
                "SELECT id FROM carts WHERE session_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1",
                Long.class,
                sessionId);

        if (!ids.isEmpty()) {
            return ids.get(0);
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO carts (session_id, status) VALUES (?, 'ACTIVE')",
                    new String[] {"id"});
            ps.setString(1, sessionId);
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    private Long cartIdForItem(Long itemId) {
        List<Long> ids = jdbcTemplate.queryForList("SELECT cart_id FROM cart_items WHERE id = ?", Long.class, itemId);
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found");
        }
        return ids.get(0);
    }

    private ProductPrice productPrice(String slug) {
        List<ProductPrice> products = jdbcTemplate.query(
                "SELECT id, price FROM products WHERE slug = ? AND status = 'AVAILABLE'",
                (rs, rowNum) -> new ProductPrice(rs.getLong("id"), rs.getBigDecimal("price")),
                slug);
        if (products.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return products.get(0);
    }

    private CartDto cartDto(Long cartId) {
        List<CartItemDto> items = jdbcTemplate.query(
                """
                SELECT ci.id, p.name, p.slug, ci.quantity, ci.unit_price, ci.subtotal,
                       cip.content, cip.font, cip.position, COALESCE(cip.engraving_price, 0) AS engraving_price,
                       COALESCE((
                           SELECT pi.image_url FROM product_images pi
                           WHERE pi.product_id = p.id
                           ORDER BY CASE WHEN pi.type = 'MAIN' THEN 0 ELSE 1 END, pi.sort_order
                           LIMIT 1
                       ), '') AS image_url
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                LEFT JOIN cart_item_personalizations cip ON cip.cart_item_id = ci.id
                WHERE ci.cart_id = ?
                ORDER BY ci.created_at DESC
                """,
                (rs, rowNum) -> new CartItemDto(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("slug"),
                        rs.getString("image_url"),
                        rs.getInt("quantity"),
                        rs.getBigDecimal("unit_price"),
                        rs.getBigDecimal("subtotal"),
                        rs.getString("content"),
                        rs.getString("font"),
                        rs.getString("position"),
                        rs.getBigDecimal("engraving_price")),
                cartId);

        BigDecimal subtotal = items.stream().map(CartItemDto::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal personalizationFee = items.stream().map(CartItemDto::engravingPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartDto(cartId, items, subtotal, personalizationFee, subtotal.add(personalizationFee));
    }

    private record ProductPrice(Long id, BigDecimal price) {
    }

    public record AddCartItemRequest(String sessionId, String productSlug, int quantity, PersonalizationRequest personalization) {
    }

    public record UpdateCartItemRequest(int quantity) {
    }

    public record PersonalizationRequest(
            String content,
            String font,
            String position,
            String previewImageUrl,
            BigDecimal engravingPrice) {
    }

    public record CartDto(Long id, List<CartItemDto> items, BigDecimal subtotal, BigDecimal personalizationFee, BigDecimal total) {
    }

    public record CartItemDto(
            Long id,
            String productName,
            String productSlug,
            String imageUrl,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal,
            String engravingContent,
            String engravingFont,
            String engravingPosition,
            BigDecimal engravingPrice) {
    }
}
