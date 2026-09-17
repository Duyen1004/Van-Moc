package com.vanmoc.category;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final JdbcTemplate jdbcTemplate;

    public CategoryController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<CategoryDto> listCategories() {
        return jdbcTemplate.query(
                """
                SELECT id, name, slug, description, image_url, status
                FROM categories
                WHERE status = 'ACTIVE'
                ORDER BY id ASC
                """,
                (rs, rowNum) -> new CategoryDto(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("slug"),
                        rs.getString("description"),
                        rs.getString("image_url"),
                        rs.getString("status")));
    }

    public record CategoryDto(
            Long id,
            String name,
            String slug,
            String description,
            String imageUrl,
            String status) {
    }
}
