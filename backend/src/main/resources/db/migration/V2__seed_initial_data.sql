INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES
('Admin Van Moc', 'mocvan2026@gmail.com', '0900000001', '{noop}admin123', 'ADMIN', 'ACTIVE'),
('Staff Van Moc', 'staff+mocvan2026@gmail.com', '0900000002', '{noop}staff123', 'STAFF', 'ACTIVE'),
('Nguyen An', 'customer+mocvan2026@gmail.com', '0900000003', NULL, 'CUSTOMER', 'ACTIVE');

INSERT INTO categories (name, slug, description, image_url, status) VALUES
('Lược sừng', 'luoc-sung', 'Các mẫu lược từ sừng tự nhiên, giữ đường vân riêng của chất liệu.', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85', 'ACTIVE'),
('Trâm cài', 'tram-cai', 'Trâm cài thủ công lấy cảm hứng từ dáng mềm của sừng tự nhiên.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85', 'ACTIVE'),
('Trang sức', 'trang-suc', 'Phụ kiện nhỏ, tinh tế và có thể khắc dấu ấn riêng.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85', 'ACTIVE'),
('Quà tặng', 'qua-tang', 'Set quà thủ công có thể cá nhân hóa cho dịp đặc biệt.', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85', 'ACTIVE');

INSERT INTO products (
    category_id, sku, name, slug, description, short_description, material, origin,
    price, stock_quantity, status, is_personalizable
) VALUES
((SELECT id FROM categories WHERE slug = 'luoc-sung'), 'VM-LS-001', 'Lược sừng tự nhiên VM01', 'luoc-sung-tu-nhien-vm01', 'Lược sừng được hoàn thiện thủ công, bề mặt mịn và giữ nguyên đường vân tự nhiên.', 'Lược sừng thủ công có thể khắc tên.', 'Sừng tự nhiên', 'Làng nghề Thụy Ứng, Hà Nội', 350000, 18, 'AVAILABLE', TRUE),
((SELECT id FROM categories WHERE slug = 'tram-cai'), 'VM-TC-001', 'Trâm cài vân sừng', 'tram-cai-van-sung', 'Trâm cài dáng thanh, được mài tay và đánh bóng thủ công.', 'Trâm cài nhẹ, sang và có vân riêng.', 'Sừng tự nhiên', 'Làng nghề Thụy Ứng, Hà Nội', 420000, 9, 'AVAILABLE', TRUE),
((SELECT id FROM categories WHERE slug = 'trang-suc'), 'VM-TS-001', 'Vòng cổ khắc tên', 'vong-co-khac-ten', 'Vòng cổ nhỏ có mặt charm cá nhân hóa bằng laser.', 'Phụ kiện cá nhân hóa tinh tế.', 'Sừng tự nhiên, dây kim loại', 'Làng nghề Thụy Ứng, Hà Nội', 520000, 12, 'AVAILABLE', TRUE),
((SELECT id FROM categories WHERE slug = 'qua-tang'), 'VM-QT-001', 'Bộ quà tặng Vân Mộc', 'bo-qua-tang-van-moc', 'Bộ quà gồm sản phẩm thủ công, hộp giấy và thiệp cá nhân hóa.', 'Set quà thủ công cho dịp đặc biệt.', 'Sừng tự nhiên, giấy mỹ thuật', 'Hà Nội, Việt Nam', 690000, 4, 'AVAILABLE', TRUE),
((SELECT id FROM categories WHERE slug = 'luoc-sung'), 'VM-LS-002', 'Lược bỏ túi thủ công', 'luoc-bo-tui-thu-cong', 'Lược nhỏ dễ mang theo, phù hợp dùng hàng ngày.', 'Lược bỏ túi nhỏ gọn.', 'Sừng tự nhiên', 'Làng nghề Thụy Ứng, Hà Nội', 280000, 22, 'AVAILABLE', TRUE),
((SELECT id FROM categories WHERE slug = 'tram-cai'), 'VM-TC-002', 'Trâm sừng dáng mảnh', 'tram-sung-dang-manh', 'Trâm dáng mảnh, tối giản và dễ phối với trang phục thường ngày.', 'Trâm sừng dáng mảnh.', 'Sừng tự nhiên', 'Làng nghề Thụy Ứng, Hà Nội', 360000, 15, 'AVAILABLE', TRUE),
((SELECT id FROM categories WHERE slug = 'qua-tang'), 'VM-QT-002', 'Móc khóa khắc tên', 'moc-khoa-khac-ten', 'Móc khóa nhỏ có thể khắc tên hoặc ký hiệu riêng.', 'Món quà nhỏ có dấu ấn riêng.', 'Sừng tự nhiên, khoen kim loại', 'Hà Nội, Việt Nam', 190000, 30, 'AVAILABLE', TRUE),
((SELECT id FROM categories WHERE slug = 'trang-suc'), 'VM-TS-002', 'Nhẫn vân sừng thủ công', 'nhan-van-sung-thu-cong', 'Nhẫn thủ công giữ sắc độ tự nhiên của từng phôi sừng.', 'Nhẫn vân sừng độc bản.', 'Sừng tự nhiên', 'Làng nghề Thụy Ứng, Hà Nội', 310000, 8, 'AVAILABLE', FALSE);

INSERT INTO product_images (product_id, image_url, type, sort_order, alt_text) VALUES
((SELECT id FROM products WHERE slug = 'luoc-sung-tu-nhien-vm01'), 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1100&q=88', 'MAIN', 1, 'Lược sừng tự nhiên VM01'),
((SELECT id FROM products WHERE slug = 'luoc-sung-tu-nhien-vm01'), 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=85', 'GALLERY', 2, 'Chi tiết vân sừng tự nhiên'),
((SELECT id FROM products WHERE slug = 'tram-cai-van-sung'), 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85', 'MAIN', 1, 'Trâm cài vân sừng'),
((SELECT id FROM products WHERE slug = 'vong-co-khac-ten'), 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85', 'MAIN', 1, 'Vòng cổ khắc tên'),
((SELECT id FROM products WHERE slug = 'bo-qua-tang-van-moc'), 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85', 'MAIN', 1, 'Bộ quà tặng Vân Mộc'),
((SELECT id FROM products WHERE slug = 'luoc-bo-tui-thu-cong'), 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85', 'MAIN', 1, 'Lược bỏ túi thủ công'),
((SELECT id FROM products WHERE slug = 'tram-sung-dang-manh'), 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85', 'MAIN', 1, 'Trâm sừng dáng mảnh'),
((SELECT id FROM products WHERE slug = 'moc-khoa-khac-ten'), 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85', 'MAIN', 1, 'Móc khóa khắc tên'),
((SELECT id FROM products WHERE slug = 'nhan-van-sung-thu-cong'), 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85', 'MAIN', 1, 'Nhẫn vân sừng thủ công');

INSERT INTO personalization_options (product_id, enabled, max_characters, engraving_price, default_font) VALUES
((SELECT id FROM products WHERE slug = 'luoc-sung-tu-nhien-vm01'), TRUE, 15, 50000, 'Cormorant Garamond'),
((SELECT id FROM products WHERE slug = 'tram-cai-van-sung'), TRUE, 12, 45000, 'Cormorant Garamond'),
((SELECT id FROM products WHERE slug = 'vong-co-khac-ten'), TRUE, 10, 60000, 'Cormorant Garamond'),
((SELECT id FROM products WHERE slug = 'bo-qua-tang-van-moc'), TRUE, 18, 70000, 'Cormorant Garamond'),
((SELECT id FROM products WHERE slug = 'luoc-bo-tui-thu-cong'), TRUE, 12, 45000, 'Cormorant Garamond'),
((SELECT id FROM products WHERE slug = 'tram-sung-dang-manh'), TRUE, 10, 45000, 'Cormorant Garamond'),
((SELECT id FROM products WHERE slug = 'moc-khoa-khac-ten'), TRUE, 10, 30000, 'Cormorant Garamond');

INSERT INTO artisans (name, slug, bio, avatar_url, workshop, status) VALUES
('Nghệ nhân Thụy Ứng', 'nghe-nhan-thuy-ung', 'Nhóm nghệ nhân địa phương chuyên mài, tạo dáng và hoàn thiện sản phẩm sừng thủ công.', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=85', 'Thụy Ứng, Thường Tín, Hà Nội', 'ACTIVE');

INSERT INTO production_batches (batch_code, artisan_id, production_date, workshop, description, status) VALUES
('VM-BATCH-2026-09', (SELECT id FROM artisans WHERE slug = 'nghe-nhan-thuy-ung'), '2026-09-01', 'Thụy Ứng, Hà Nội', 'Lô sản phẩm sừng tự nhiên hoàn thiện thủ công trong tháng 09/2026.', 'ACTIVE');

INSERT INTO trace_products (trace_code, product_id, batch_id, status, qr_url) VALUES
('VM000123', (SELECT id FROM products WHERE slug = 'luoc-sung-tu-nhien-vm01'), (SELECT id FROM production_batches WHERE batch_code = 'VM-BATCH-2026-09'), 'ACTIVE', 'https://vanmoc.vn/trace/VM000123');

INSERT INTO trace_events (trace_product_id, event_type, title, description, event_date, image_url, sort_order) VALUES
((SELECT id FROM trace_products WHERE trace_code = 'VM000123'), 'MATERIAL', 'Chọn chất liệu', 'Phôi sừng được chọn theo sắc độ, độ chắc và đường vân tự nhiên.', '2026-09-01', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85', 1),
((SELECT id FROM trace_products WHERE trace_code = 'VM000123'), 'CRAFT', 'Mài tạo dáng', 'Nghệ nhân mài từng cạnh để sản phẩm cầm chắc tay và không sắc.', '2026-09-03', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=85', 2),
((SELECT id FROM trace_products WHERE trace_code = 'VM000123'), 'FINISHING', 'Đánh bóng hoàn thiện', 'Bề mặt được đánh bóng để giữ cảm giác mịn và ánh tự nhiên của sừng.', '2026-09-05', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85', 3);

INSERT INTO product_reviews (product_id, user_id, customer_name, rating, title, content, status) VALUES
((SELECT id FROM products WHERE slug = 'luoc-sung-tu-nhien-vm01'), (SELECT id FROM users WHERE email = 'customer+mocvan2026@gmail.com'), 'Nguyễn An', 5, 'Vân đẹp và cầm chắc tay', 'Lược cầm rất thích, phần khắc tên sắc nét và hộp quà chỉn chu.', 'APPROVED'),
((SELECT id FROM products WHERE slug = 'tram-cai-van-sung'), NULL, 'Linh', 5, 'Trâm nhẹ và sang', 'Dáng trâm mảnh, màu vân ngoài đời ấm hơn ảnh.', 'APPROVED'),
((SELECT id FROM products WHERE slug = 'bo-qua-tang-van-moc'), NULL, 'Thu Hà', 4, 'Quà tặng tinh tế', 'Set quà đóng gói đẹp, phù hợp tặng sinh nhật.', 'APPROVED');

INSERT INTO banners (title, subtitle, image_url, link_url, position, status, sort_order) VALUES
('Sản phẩm mới từ sừng tự nhiên', 'Mỗi món đồ Vân Mộc được hoàn thiện thủ công và có thể khắc tên riêng.', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=88', '/products', 'HOME', 'ACTIVE', 1),
('Quà tặng cá nhân hóa', 'Khắc laser theo yêu cầu và truy xuất hành trình sản phẩm qua QR.', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=88', '/personalize/demo', 'HOME', 'ACTIVE', 2);
