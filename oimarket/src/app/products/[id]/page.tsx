import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

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

  // 작성자(판매자) 공개 프로필 불러오기
  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("nickname, bio, avatar_url")
    .eq("id", product.user_id)
    .single();

  const nickname = authorProfile?.nickname ?? "농부";
  const authorBio = authorProfile?.bio ?? null;
  const authorAvatar = authorProfile?.avatar_url ?? null;

  // 좋아요 수 + 현재 사용자 좋아요 여부
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  let userLiked = false;
  if (user) {
    const { data: userLike } = await supabase
      .from("likes")
      .select("id")
      .eq("product_id", id)
      .eq("user_id", user.id)
      .single();
    userLiked = !!userLike;
  }

  // 댓글/대댓글 불러오기 (오래된 순)
  const { data: rawComments } = await supabase
    .from("comments")
    .select("id, parent_id, author_nickname, content, created_at, edited_at, user_id")
    .eq("product_id", id)
    .order("created_at", { ascending: true });

  // 댓글별 좋아요 수 + 현재 사용자가 누른 댓글 모으기
  const commentIds = (rawComments ?? []).map((c) => c.id);
  const commentLikeCount: Record<string, number> = {};
  const myLikedComments = new Set<string>();
  if (commentIds.length > 0) {
    const { data: clikes } = await supabase
      .from("comment_likes")
      .select("comment_id, user_id")
      .in("comment_id", commentIds);
    for (const cl of clikes ?? []) {
      commentLikeCount[cl.comment_id] = (commentLikeCount[cl.comment_id] ?? 0) + 1;
      if (user && cl.user_id === user.id) myLikedComments.add(cl.comment_id);
    }
  }

  const comments = (rawComments ?? []).map((c) => ({
    ...c,
    like_count: commentLikeCount[c.id] ?? 0,
    liked_by_me: myLikedComments.has(c.id),
  }));

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

            {/* 판매자 프로필 (누르면 그 사람 페이지로 이동) */}
            <Link
              href={`/users/${product.user_id}`}
              className="flex items-start gap-3 mb-4 rounded-2xl -m-2 p-2 hover:bg-cream/60 transition-colors group"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden bg-leaf-soft flex items-center justify-center text-lg shrink-0 border border-bark-soft">
                {authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={authorAvatar}
                    alt={nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "🧑‍🌾"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-soil group-hover:text-cucumber-dark transition-colors">
                    {nickname}
                  </p>
                  {isOwner && (
                    <span className="text-[10px] font-bold text-cucumber-dark bg-leaf-soft rounded-full px-1.5 py-0.5">
                      나
                    </span>
                  )}
                  <span className="ml-auto text-xs text-soil-soft/50 group-hover:text-cucumber-dark transition-colors">
                    글 모아보기 →
                  </span>
                </div>
                <p className="text-xs text-soil-soft/60">
                  {product.location ? `📍 ${product.location}` : "동네 미설정"}
                </p>
                {authorBio && (
                  <p className="text-xs text-soil-soft mt-1 whitespace-pre-wrap leading-relaxed">
                    {authorBio}
                  </p>
                )}
              </div>
            </Link>

            <hr className="border-bark-soft mb-4" />

            {/* 설명 */}
            {product.description ? (
              <p className="text-soil text-sm leading-relaxed whitespace-pre-wrap mb-6">
                {product.description}
              </p>
            ) : (
              <p className="text-soil-soft/60 text-sm mb-6">설명이 없어요.</p>
            )}

            {/* 좋아요 */}
            <div className="flex items-center gap-3 py-4 border-t border-bark-soft">
              <LikeButton
                productId={id}
                initialLiked={userLiked}
                initialCount={likeCount ?? 0}
                isLoggedIn={!!user}
              />
              {!user && (
                <p className="text-xs text-soil-soft/60">로그인하면 좋아요를 누를 수 있어요</p>
              )}
            </div>

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

        {/* 댓글 영역 */}
        <CommentSection
          productId={id}
          comments={comments ?? []}
          currentUserId={user?.id ?? null}
          isLoggedIn={!!user}
        />
      </main>
    </>
  );
}
