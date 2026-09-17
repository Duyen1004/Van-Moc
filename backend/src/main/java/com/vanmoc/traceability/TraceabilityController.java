package com.vanmoc.traceability;

import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trace")
public class TraceabilityController {
    private final JdbcTemplate jdbcTemplate;

    public TraceabilityController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/{code}")
    public TraceProductDto getTraceProduct(@PathVariable String code) {
        return jdbcTemplate.queryForObject(
                """
                SELECT tp.id, tp.trace_code, tp.qr_url, p.name AS product_name, p.slug AS product_slug,
                       p.material, p.origin, pb.batch_code, pb.production_date, pb.workshop,
                       a.name AS artisan_name
                FROM trace_products tp
                JOIN products p ON p.id = tp.product_id
                LEFT JOIN production_batches pb ON pb.id = tp.batch_id
                LEFT JOIN artisans a ON a.id = pb.artisan_id
                WHERE tp.trace_code = ?
                """,
                (rs, rowNum) -> new TraceProductDto(
                        rs.getLong("id"),
                        rs.getString("trace_code"),
                        rs.getString("qr_url"),
                        rs.getString("product_name"),
                        rs.getString("product_slug"),
                        rs.getString("material"),
                        rs.getString("origin"),
                        rs.getString("batch_code"),
                        rs.getObject("production_date", LocalDate.class),
                        rs.getString("workshop"),
                        rs.getString("artisan_name"),
                        eventsForTrace(rs.getLong("id"))),
                code);
    }

    private List<TraceEventDto> eventsForTrace(Long traceProductId) {
        return jdbcTemplate.query(
                """
                SELECT event_type, title, description, event_date, image_url, video_url
                FROM trace_events
                WHERE trace_product_id = ?
                ORDER BY sort_order ASC
                """,
                (rs, rowNum) -> new TraceEventDto(
                        rs.getString("event_type"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getObject("event_date", LocalDate.class),
                        rs.getString("image_url"),
                        rs.getString("video_url")),
                traceProductId);
    }

    public record TraceProductDto(
            Long id,
            String traceCode,
            String qrUrl,
            String productName,
            String productSlug,
            String material,
            String origin,
            String batchCode,
            LocalDate productionDate,
            String workshop,
            String artisanName,
            List<TraceEventDto> events) {
    }

    public record TraceEventDto(
            String eventType,
            String title,
            String description,
            LocalDate eventDate,
            String imageUrl,
            String videoUrl) {
    }
}
