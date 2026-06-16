import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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
  status: string;
  image_url: string | null;
  created_at: string;
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // 작성자 공개 프로필
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, bio, avatar_url")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  // 현재 로그인 사용자(본인인지 확인용)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isMe = user?.id === id;

  // 이 사람이 올린 상품
  const { data: products } = await supabase
    .from("products")
    .select("id, title, description, price, category, location, status, image_url, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const list: Product[] = products ?? [];

  return (
    <>
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur border-b border-bark-soft">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/products" className="text-sm text-soil-soft hover:text-soil">
            ← 장터로
          </Link>
          <span className="text-soil-soft/40">|</span>
          <Link href="/" className="flex items-center gap-1.5 font-black text-cucumber-dark">
            <span className="text-xl">🥒</span>
            <span>오이마켓</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* 프로필 카드 */}
        <section className="bg-paper rounded-3xl border border-bark-soft shadow-sm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-bark-soft bg-leaf-soft flex items-center justify-center text-4xl shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                "🧑‍🌾"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-soil">{profile.nickname}</h1>
                {isMe && (
                  <span className="text-[10px] font-bold text-cucumber-dark bg-leaf-soft rounded-full px-1.5 py-0.5">
                    나
                  </span>
                )}
              </div>
              {profile.bio ? (
                <p className="text-sm text-soil-soft mt-1.5 whitespace-pre-wrap leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-soil-soft/60 mt-1.5">아직 자기소개가 없어요.</p>
              )}
              {isMe && (
                <Link
                  href="/mypage"
                  className="inline-block mt-3 text-sm font-bold text-cucumber-dark hover:underline"
                >
                  프로필 수정하기
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* 올린 상품 목록 */}
        <h2 className="text-lg font-bold text-soil mb-3">
          🧺 {profile.nickname}님이 올린 상품{" "}
          <span className="text-cucumber-dark">{list.length}</span>
        </h2>

        {list.length === 0 ? (
          <div className="bg-paper rounded-2xl border border-dashed border-bark-soft p-12 text-center text-soil-soft">
            <p className="text-3xl mb-3">🌱</p>
            <p>아직 올린 상품이 없어요.</p>
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
                      <p className="font-bold text-soil group-hover:text-cucumber-dark transition-colors line-clamp-2 text-sm mb-2">
                        {p.title}
                      </p>
                      <div className="flex items-end justify-between">
                        <span className="font-black text-cucumber-dark text-sm">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-xs text-soil-soft/70">
                          {p.location ? `📍${p.location}` : ""}
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
