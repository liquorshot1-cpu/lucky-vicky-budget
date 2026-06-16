import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signout } from "@/app/auth/actions";

function formatPrice(price: number) {
  if (!price) return "나눔 🎁";
  return price.toLocaleString("ko-KR") + "원";
}

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  location: string | null;
  image_url: string | null;
  created_at: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nickname =
    (user?.user_metadata?.nickname as string | undefined) ?? "농부";

  let myProducts: Product[] = [];
  if (user) {
    const { data } = await supabase
      .from("products")
      .select("id, title, description, price, category, location, image_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    myProducts = data ?? [];
  }

  return (
    <>
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur border-b border-bark-soft">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-cucumber-dark">
            <span className="text-2xl">🥒</span>
            <span>오이마켓</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/products"
              className="text-sm font-medium text-soil-soft hover:text-soil px-3 py-1.5 rounded-lg hover:bg-bark-soft/50 transition-colors"
            >
              장터 구경
            </Link>
            {user ? (
              <>
                <Link
                  href="/sell"
                  className="text-sm font-bold text-white bg-cucumber hover:bg-cucumber-dark px-3 py-1.5 rounded-lg transition-colors"
                >
                  + 판매글 쓰기
                </Link>
                <form action={signout}>
                  <button className="text-sm font-medium text-soil-soft hover:text-soil px-3 py-1.5 rounded-lg hover:bg-bark-soft/50 transition-colors">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-soil-soft hover:text-soil px-3 py-1.5 rounded-lg hover:bg-bark-soft/50 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-bold text-white bg-cucumber hover:bg-cucumber-dark px-3 py-1.5 rounded-lg transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {user ? (
          <>
            {registered && (
              <p className="mb-5 text-sm rounded-xl bg-leaf-soft text-cucumber-dark px-4 py-3">
                ✅ 상품이 텃밭에 올라갔어요!
              </p>
            )}

            <section className="bg-paper rounded-3xl border border-bark-soft shadow-sm p-7 text-center mb-8">
              <div className="text-5xl mb-3">🧑‍🌾🥬🍅</div>
              <h1 className="text-2xl font-black text-soil">
                <span className="text-cucumber-dark">{nickname}</span>님, 다시 오셨네요!
              </h1>
              <p className="text-soil-soft mt-2 text-sm">로그인 계정: {user.email}</p>
            </section>

            {/* 내가 등록한 상품 */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-soil">🧺 내가 올린 상품</h2>
              <Link
                href="/sell"
                className="text-sm font-bold text-cucumber-dark hover:underline"
              >
                + 새로 등록
              </Link>
            </div>

            {myProducts.length === 0 ? (
              <div className="bg-paper rounded-2xl border border-dashed border-bark-soft p-8 text-center text-soil-soft">
                아직 올린 상품이 없어요. <br />
                <Link href="/sell" className="font-bold text-cucumber-dark hover:underline">
                  첫 상품을 등록해 보세요 🌱
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {myProducts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      className="block bg-paper rounded-2xl border border-bark-soft p-4 hover:border-cucumber hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {/* 썸네일 */}
                        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-bark-soft bg-leaf-soft flex items-center justify-center">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🥬</span>
                          )}
                        </div>

                        {/* 텍스트 */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="shrink-0 text-xs font-medium text-cucumber-dark bg-leaf-soft rounded-full px-2 py-0.5">
                              {p.category}
                            </span>
                            <p className="font-bold text-soil truncate">{p.title}</p>
                          </div>
                          {p.description && (
                            <p className="text-sm text-soil-soft line-clamp-1">
                              {p.description}
                            </p>
                          )}
                          <p className="text-xs text-soil-soft/60 mt-0.5">
                            {p.location ? `📍 ${p.location} · ` : ""}
                            {new Date(p.created_at).toLocaleDateString("ko-KR")}
                          </p>
                        </div>

                        <span className="shrink-0 font-black text-cucumber-dark">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <section className="bg-paper rounded-3xl border border-bark-soft shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🧑‍🌾🥬🍅</div>
            <h1 className="text-2xl font-black text-soil">
              농장에서 우리 동네로,<br />
              <span className="text-cucumber-dark">신선한 중고 직거래</span>
            </h1>
            <p className="text-soil-soft mt-3">
              오이마켓에서 텃밭 이웃과 따뜻하게 거래해 보세요. 🌱
            </p>
            <div className="flex flex-col items-center gap-2 mt-6">
              <div className="flex items-center gap-2">
                <Link
                  href="/signup"
                  className="rounded-xl bg-cucumber hover:bg-cucumber-dark text-white font-bold px-5 py-3 transition-colors"
                >
                  농부로 시작하기
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-bark-soft bg-cream/40 text-soil font-bold px-5 py-3 hover:bg-bark-soft/40 transition-colors"
                >
                  로그인
                </Link>
              </div>
              <Link
                href="/products"
                className="text-sm text-soil-soft hover:text-cucumber-dark hover:underline mt-1"
              >
                로그인 없이 동네 장터 구경하기 →
              </Link>
            </div>
          </section>
        )}

        <p className="text-center text-xs text-soil-soft/60 mt-10">
          🚜 4단계: 이미지 업로드 완료 — 다음은 채팅 기능이 자라날 차례예요.
        </p>
      </main>
    </>
  );
}
