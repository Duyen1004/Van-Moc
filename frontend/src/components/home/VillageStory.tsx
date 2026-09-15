export function VillageStory() {
  return (
    <section className="bg-bark px-5 py-14 text-ivory md:px-10 md:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
        <div className="grid grid-cols-[0.75fr_1fr] gap-5">
          <img
            alt="Nghệ nhân hoàn thiện sản phẩm thủ công"
            className="h-[340px] w-full rounded-lg object-cover"
            src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=85"
          />
          <img
            alt="Chi tiết chất liệu thủ công màu nâu tự nhiên"
            className="mt-10 h-[340px] w-full rounded-lg object-cover"
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase text-clay">Làng nghề Thụy Ứng</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">
            Từ phôi thô đến bề mặt bóng mịn là một quá trình của kiên nhẫn.
          </h2>
          <p className="mt-5 text-base leading-8 text-sand">
            Vân Mộc đặt câu chuyện làng nghề ở trung tâm: chọn chất liệu, tạo hình, mài, đánh bóng và kiểm tra từng chi tiết trước khi sản phẩm đến tay khách hàng.
          </p>
          <blockquote className="mt-8 border-l border-clay pl-5 font-serif text-2xl font-medium italic leading-snug tracking-wide text-linen md:text-3xl">
            "Lược sừng sang xịn mịn, cầm lên là thấy khác."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
