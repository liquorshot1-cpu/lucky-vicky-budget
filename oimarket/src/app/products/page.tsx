import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { CATEGORIES } from "@/app/products/categories";

function formatPrice(price: number) {
  if (!price) return "나눔 🎁";
  return price.toLocaleString("ko-KR") + "원";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string | null;
  status: string;
  image_url: string | null;
  created_at: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; deleted?: string }>;
}) {
  const { category, deleted } = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, title, price, category, location, status, image_url, created_at")
    .order("created_at", { ascending: false });

  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    query = query.eq("category", category);
  }

  const { data: products } = await query;
  const list: Product[] = products ?? [];

  return (
    <>
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur border-b border-bark-soft">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-cucumber-dark">
            <span className="text-2xl">🥒</span>
            <span>오이마켓</span>
          </Link>
          <Link
            href="/sell"
            className="text-sm font-bold text-white bg-cucumber hover:bg-cucumber-dark px-3 py-1.5 rounded-lg transition-colors"
          >
            + 판매글 쓰기
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {deleted && (
          <p className="mb-5 text-sm rounded-xl bg-bark-soft/50 text-soil-soft px-4 py-3">
            판매글이 삭제됐어요.
          </p>
        )}

        <h1 className="text-xl font-black text-soil mb-4">🌾 동네 텃밭 장터</h1>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <Link
            href="/products"
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !category
                ? "bg-cucumber text-white border-cucumber"
                : "bg-paper text-soil-soft border-bark-soft hover:border-cucumber hover:text-cucumber-dark"
            }`}
          >
            전체
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/products?category=${encodeURIComponent(c)}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === c
                  ? "bg-cucumber text-white border-cucumber"
                  : "bg-paper text-soil-soft border-bark-soft hover:border-cucumber hover:text-cucumber-dark"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* 판매글 목록 */}
        {list.length === 0 ? (
          <div className="bg-paper rounded-2xl border border-dashed border-bark-soft p-12 text-center text-soil-soft">
            <p className="text-3xl mb-3">🌱</p>
            <p>아직 판매글이 없어요.</p>
            <Link
              href="/sell"
              className="mt-4 inline-block font-bold text-cucumber-dark hover:underline"
            >
              첫 글을 올려보세요
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="block bg-paper rounded-2xl border border-bark-soft p-4 hover:border-cucumber hover:shadow-sm transition-all group"
                >
                  <div className="flex gap-3">
                    {/* 썸네일 */}
                    <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-bark-soft bg-leaf-soft flex items-center justify-center">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🥬</span>
                      )}
                    </div>

                    {/* 텍스트 */}
                    <div className="flex-1 min-w-0">
                      {/* 카테고리 배지 + 상태 */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-cucumber-dark bg-leaf-soft rounded-full px-2 py-0.5">
                          {p.category}
                        </span>
                        {p.status === "sold" && (
                          <span className="text-xs font-bold text-white bg-soil-soft rounded-full px-2 py-0.5">
                            판매완료
                          </span>
                        )}
                      </div>

                      {/* 제목 */}
                      <p className="font-bold text-soil group-hover:text-cucumber-dark transition-colors line-clamp-2 text-sm mb-2">
                        {p.title}
                      </p>

                      {/* 가격 + 동네·시간 */}
                      <div className="flex items-end justify-between">
                        <span className="font-black text-cucumber-dark text-sm">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-xs text-soil-soft/70">
                          {p.location ? `📍${p.location} · ` : ""}
                          {timeAgo(p.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
