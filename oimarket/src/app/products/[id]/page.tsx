import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DeleteButton from "@/components/DeleteButton";

function formatPrice(price: number) {
  if (!price) return "나눔 🎁";
  return price.toLocaleString("ko-KR") + "원";
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { id } = await params;
  const { updated, error } = await searchParams;

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, title, description, price, category, location, status, created_at, user_id, image_url")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === product.user_id;

  const nickname = isOwner
    ? ((user?.user_metadata?.nickname as string | undefined) ?? "농부")
    : "농부";

  return (
    <>
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur border-b border-bark-soft">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/products" className="text-sm text-soil-soft hover:text-soil">
            ← 목록으로
          </Link>
          <span className="text-soil-soft/40">|</span>
          <Link href="/" className="flex items-center gap-1.5 font-black text-cucumber-dark">
            <span className="text-xl">🥒</span>
            <span>오이마켓</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        {updated && (
          <p className="mb-4 text-sm rounded-xl bg-leaf-soft text-cucumber-dark px-4 py-3">
            ✅ 판매글이 수정됐어요!
          </p>
        )}
        {error && (
          <p className="mb-4 text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3">
            {error}
          </p>
        )}

        <div className="bg-paper rounded-3xl border border-bark-soft shadow-sm overflow-hidden">
          {/* 상품 이미지 */}
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="bg-leaf-soft flex items-center justify-center h-52 text-5xl">
              🥬
            </div>
          )}

          <div className="p-6">
            {/* 카테고리 + 상태 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-cucumber-dark bg-leaf-soft rounded-full px-2.5 py-1">
                {product.category}
              </span>
              {product.status === "sold" && (
                <span className="text-xs font-bold text-white bg-soil-soft rounded-full px-2.5 py-1">
                  판매완료
                </span>
              )}
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-black text-soil mb-2 leading-tight">
              {product.title}
            </h1>

            {/* 등록일 */}
            <p className="text-xs text-soil-soft/60 mb-4">
              {new Date(product.created_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <hr className="border-bark-soft mb-4" />

            {/* 판매자 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-bark-soft flex items-center justify-center text-lg">
                🧑‍🌾
              </div>
              <div>
                <p className="text-sm font-bold text-soil">{nickname}</p>
                <p className="text-xs text-soil-soft/60">
                  {product.location ? `📍 ${product.location}` : "동네 미설정"}
                </p>
              </div>
            </div>

            <hr className="border-bark-soft mb-4" />

            {/* 설명 */}
            {product.description ? (
              <p className="text-soil text-sm leading-relaxed whitespace-pre-wrap mb-6">
                {product.description}
              </p>
            ) : (
              <p className="text-soil-soft/60 text-sm mb-6">설명이 없어요.</p>
            )}

            {/* 가격 + 버튼 영역 */}
            <div className="pt-4 border-t border-bark-soft">
              <span className="text-2xl font-black text-cucumber-dark block mb-4">
                {formatPrice(product.price)}
              </span>

              {isOwner ? (
                <div className="flex gap-2">
                  <Link
                    href={`/products/${id}/edit`}
                    className="flex-1 text-center rounded-xl bg-cucumber hover:bg-cucumber-dark text-white font-bold py-2.5 transition-colors text-sm"
                  >
                    ✏️ 수정하기
                  </Link>
                  <DeleteButton id={id} />
                </div>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl bg-cucumber text-white font-bold py-2.5 text-sm opacity-60 cursor-not-allowed"
                >
                  채팅하기 (준비 중)
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
