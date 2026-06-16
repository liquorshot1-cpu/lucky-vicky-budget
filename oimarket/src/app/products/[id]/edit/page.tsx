import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { updateProduct } from "@/app/products/actions";
import { CATEGORIES } from "@/app/products/categories";
import ImageUpload from "@/components/ImageUpload";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?message=" + encodeURIComponent("로그인이 필요해요. 🌱"));
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, title, description, price, category, location, user_id, image_url")
    .eq("id", id)
    .single();

  if (!product) notFound();

  if (product.user_id !== user.id) {
    redirect(`/products/${id}`);
  }

  const inputClass =
    "w-full rounded-xl border border-bark-soft bg-cream/40 px-4 py-2.5 text-soil outline-none focus:border-cucumber focus:ring-2 focus:ring-leaf-soft";

  const updateProductWithId = updateProduct.bind(null, id);

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
      <Link href={`/products/${id}`} className="text-sm text-soil-soft hover:text-soil">
        ← 돌아가기
      </Link>

      <div className="bg-paper rounded-3xl border border-bark-soft shadow-sm p-7 mt-4">
        <h1 className="text-xl font-black text-cucumber-dark mb-1">✏️ 판매글 수정</h1>
        <p className="text-sm text-soil-soft mb-6">내용을 수정하고 저장하세요.</p>

        {error && (
          <p className="mb-4 text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3">
            {error}
          </p>
        )}

        <form action={updateProductWithId} className="space-y-4">
          {/* 사진 업로드 (기존 사진 표시) */}
          <ImageUpload existingUrl={product.image_url} />

          {/* 상품 이름 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-soil-soft mb-1">
              상품 이름 *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={product.title}
              className={inputClass}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-soil-soft mb-1">
              카테고리
            </label>
            <select
              id="category"
              name="category"
              defaultValue={product.category}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 가격 */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-soil-soft mb-1">
              가격 (원)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              defaultValue={product.price}
              className={inputClass}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-soil-soft">
              <input
                type="checkbox"
                name="isFree"
                defaultChecked={product.price === 0}
                className="h-4 w-4 rounded border-bark-soft text-cucumber focus:ring-leaf-soft"
              />
              나눔(무료)으로 올리기 🎁
            </label>
          </div>

          {/* 거래 희망 동네 */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-soil-soft mb-1">
              거래 희망 동네
            </label>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={product.location ?? ""}
              className={inputClass}
            />
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-soil-soft mb-1">
              설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description ?? ""}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Link
              href={`/products/${id}`}
              className="flex-1 text-center rounded-xl border border-bark-soft text-soil-soft font-bold py-3 hover:bg-bark-soft/40 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-cucumber hover:bg-cucumber-dark text-white font-bold py-3 transition-colors"
            >
              저장하기 ✅
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
