package com.vanmoc.review;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final JdbcTemplate jdbcTemplate;

    public ReviewController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<ReviewDto> listReviews() {
        return jdbcTemplate.query(
                """
                SELECT pr.id, pr.customer_name, pr.rating, pr.title, pr.content, p.name AS product_name
                FROM product_reviews pr
                JOIN products p ON p.id = pr.product_id
                WHERE pr.status = 'APPROVED'
                ORDER BY pr.created_at DESC
                """,
                (rs, rowNum) -> new ReviewDto(
                        rs.getLong("id"),
                        rs.getString("customer_name"),
                        rs.getInt("rating"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getString("product_name")));
    }

    public record ReviewDto(Long id, String customerName, Integer rating, String title, String content, String productName) {
    }
}
