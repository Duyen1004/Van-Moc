const values = [
  {
    number: "01",
    label: "Chất liệu",
    title: "Vân sừng tự nhiên",
    text: "Giữ sắc độ nguyên bản, từng đường vân và độ chuyển màu riêng của chất liệu.",
  },
  {
    number: "02",
    label: "Làng nghề",
    title: "Tay nghề Thụy Ứng",
    text: "Mài giũa, tạo dáng và hoàn thiện bằng kinh nghiệm của người thợ thủ công.",
  },
  {
    number: "03",
    label: "Dấu ấn",
    title: "Cá nhân hóa & QR",
    text: "Khắc tên theo yêu cầu và truy xuất hành trình chế tác bằng mã định danh.",
  },
];

export function BrandStory() {
  return (
    <section className="bg-[#f4ead8] px-5 py-12 md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-horn">Tinh thần Vân Mộc</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] text-bark md:text-5xl">
            Tự nhiên, thủ công
            <br />
            và mang dấu ấn riêng.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-horn">
            Một món đồ Vân Mộc không cần phô trương. Giá trị nằm ở chất liệu thật, bàn tay người thợ và câu chuyện được lưu lại theo cách riêng.
          </p>
        </div>

        <div className="mt-8 border-y border-clay/30">
          <div className="grid divide-y divide-clay/25 md:grid-cols-3 md:divide-x md:divide-y-0">
            {values.map((item) => (
              <div className="px-0 py-5 md:px-6" key={item.title}>
                <div className="flex items-center justify-between gap-5">
                  <p className="font-serif text-2xl font-semibold text-clay/80">{item.number}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-horn">{item.label}</p>
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-bark">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-horn">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
