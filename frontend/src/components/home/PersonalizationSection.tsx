export function PersonalizationSection() {
  return (
    <section className="bg-ivory px-5 py-20 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
        <div className="rounded-lg border border-sand bg-pearl p-8 md:p-10">
          <h2 className="font-serif text-4xl text-bark">Khắc dấu riêng trên sản phẩm thủ công.</h2>
          <p className="mt-5 leading-8 text-horn">
            Khách hàng có thể chọn vị trí, nhập nội dung, chọn font và xem trước bản khắc trước khi thêm vào giỏ hàng.
          </p>
          <div className="mt-8 rounded-lg bg-sand p-6">
            <p className="text-xs font-semibold uppercase text-horn">Bản xem trước</p>
            <div className="mt-5 rounded-lg bg-wood px-6 py-10 text-center font-serif text-3xl text-linen">
              NGUYỄN AN
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-wood p-8 text-ivory md:p-10">
          <h2 className="font-serif text-4xl">Truy xuất sản phẩm qua QR.</h2>
          <p className="mt-5 leading-8 text-sand">
            Mỗi mã truy xuất có thể gắn với sản phẩm hoặc lô sản xuất, hiển thị chất liệu, nguồn gốc, công đoạn chế tác và hướng dẫn bảo quản.
          </p>
          <div className="mt-10 grid gap-3 text-sm">
            {["Mã VM000123", "Đợt sản xuất VM-BATCH-2026-09", "Nghệ nhân và công đoạn hoàn thiện"].map((item) => (
              <div className="rounded-full border border-clay/50 px-5 py-3" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
