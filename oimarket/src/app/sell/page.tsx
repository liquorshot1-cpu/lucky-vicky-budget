import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createProduct } from "@/app/products/actions";
import { CATEGORIES } from "@/app/products/categories";
import ImageUpload from "@/components/ImageUpload";

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?message=" + encodeURIComponent("상품을 등록하려면 먼저 로그인해 주세요. 🌱"));
  }

  const inputClass =
    "w-full rounded-xl border border-bark-soft bg-cream/40 px-4 py-2.5 text-soil outline-none focus:border-cucumber focus:ring-2 focus:ring-leaf-soft";

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
      <Link href="/" className="text-sm text-soil-soft hover:text-soil">
        ← 홈으로
      </Link>

      <div className="bg-paper rounded-3xl border border-bark-soft shadow-sm p-7 mt-4">
        <h1 className="text-xl font-black text-cucumber-dark mb-1">
          🧺 판매글 작성
        </h1>
        <p className="text-sm text-soil-soft mb-6">
          텃밭 이웃에게 내놓을 물건을 올려 보세요.
        </p>

        {error && (
          <p className="mb-4 text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3">
            {error}
          </p>
        )}

        <form action={createProduct} className="space-y-4">
          {/* 사진 업로드 */}
          <ImageUpload />

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
              placeholder="예) 갓 수확한 오이 한 박스"
              className={inputClass}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-soil-soft mb-1">
              카테고리
            </label>
            <select id="category" name="category" defaultValue="기타" className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 가격 + 나눔 */}
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
              placeholder="0"
              className={inputClass}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-soil-soft">
              <input
                type="checkbox"
                name="isFree"
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
              placeholder="예) 햇살농장 마을회관 앞"
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
              placeholder="상태, 거래 방법 등을 적어 주세요."
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-cucumber hover:bg-cucumber-dark text-white font-bold py-3 transition-colors"
          >
            텃밭에 내놓기 🌾
          </button>
        </form>
      </div>
    </main>
  );
}
