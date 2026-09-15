import { ShoppingCart } from "lucide-react";

const products = [
  {
    name: "Lược sừng tự nhiên VM01",
    price: "350.000đ",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Trâm cài vân sừng",
    price: "420.000đ",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Bộ quà tặng khắc tên",
    price: "690.000đ",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Lược bỏ túi thủ công",
    price: "280.000đ",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Lược chải tóc vân nâu",
    price: "390.000đ",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Trâm sừng dáng mảnh",
    price: "360.000đ",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Móc khóa khắc tên",
    price: "190.000đ",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Set quà thủ công Vân Mộc",
    price: "820.000đ",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85",
  },
];

export function FeaturedProducts() {
  return (
    <section className="bg-pearl px-5 py-14 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase text-horn">Sản phẩm nổi bật</p>
          <h2 className="mt-3 font-serif text-3xl text-bark md:text-4xl">Bán chạy trong mùa này</h2>
          <p className="mt-4 text-sm leading-7 text-horn">
            Những món thủ công có vân sắc riêng, phù hợp làm quà tặng cá nhân hóa hoặc sử dụng hằng ngày.
          </p>
        </div>

        <div className="mt-9 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article className="group" key={product.name}>
              <div className="overflow-hidden rounded-lg bg-sand">
                <img
                  alt={product.name}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                  src={product.image}
                />
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase text-horn">Có thể khắc tên</p>
                <h3 className="mt-2 min-h-10 text-base font-semibold text-bark">{product.name}</h3>
                <p className="mt-3 text-sm font-semibold text-wood">{product.price}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    aria-label="Thêm vào giỏ hàng"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-clay/60 text-bark transition hover:border-wood hover:bg-sand"
                    title="Thêm vào giỏ hàng"
                    type="button"
                  >
                    <ShoppingCart className="size-4" />
                  </button>
                  <button
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-wood px-4 text-xs font-semibold uppercase tracking-wide text-ivory transition hover:bg-bark"
                    type="button"
                  >
                    Mua hàng
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
