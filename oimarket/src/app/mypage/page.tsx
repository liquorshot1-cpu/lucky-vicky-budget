import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ImageUpload from "@/components/ImageUpload";
import { updateProfile } from "@/app/mypage/actions";

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=" + encodeURIComponent("마이페이지는 로그인 후 이용할 수 있어요. 🌱"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, bio, avatar_url")
    .eq("id", user.id)
    .single();

  const nickname =
    profile?.nickname ??
    (user.user_metadata?.nickname as string | undefined) ??
    "농부";

  return (
    <>
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur border-b border-bark-soft">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 font-black text-cucumber-dark">
            <span className="text-xl">🥒</span>
            <span>오이마켓</span>
          </Link>
          <span className="text-soil-soft/40">|</span>
          <span className="text-sm font-bold text-soil">마이페이지</span>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        {saved && (
          <p className="mb-4 text-sm rounded-xl bg-leaf-soft text-cucumber-dark px-4 py-3">
            ✅ 프로필을 저장했어요!
          </p>
        )}
        {error && (
          <p className="mb-4 text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3">
            {error}
          </p>
        )}

        <h1 className="text-xl font-black text-soil mb-1">🧑‍🌾 내 프로필</h1>
        <p className="text-sm text-soil-soft mb-6">
          다른 농부들이 보는 내 모습이에요. 사진과 한 줄 소개를 채워 보세요.
        </p>

        <form
          action={updateProfile}
          className="bg-paper rounded-3xl border border-bark-soft shadow-sm p-6 space-y-6"
        >
          {/* 프로필 사진 */}
          <ImageUpload
            existingUrl={profile?.avatar_url ?? null}
            bucket="avatars"
            fieldName="avatar_url"
            label="프로필 사진"
            shape="circle"
          />

          {/* 닉네임 */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-soil-soft mb-1">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              defaultValue={nickname}
              maxLength={20}
              placeholder="예) 오이농부"
              className="w-full rounded-xl border border-bark-soft bg-cream/40 px-4 py-2.5 text-soil placeholder:text-soil-soft/50 focus:outline-none focus:border-cucumber"
            />
          </div>

          {/* 자기소개 */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-soil-soft mb-1">
              자기소개
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={300}
              defaultValue={profile?.bio ?? ""}
              placeholder="예) 텃밭에서 키운 채소를 나눠요. 신선한 거래 환영해요! 🥬"
              className="w-full rounded-xl border border-bark-soft bg-cream/40 px-4 py-2.5 text-soil placeholder:text-soil-soft/50 focus:outline-none focus:border-cucumber resize-none"
            />
            <p className="mt-1 text-xs text-soil-soft/60">최대 300자</p>
          </div>

          {/* 이메일(읽기 전용 안내) */}
          <div>
            <p className="block text-sm font-medium text-soil-soft mb-1">로그인 계정</p>
            <p className="text-sm text-soil-soft/70 bg-cream/40 border border-bark-soft rounded-xl px-4 py-2.5">
              {user.email}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-cucumber hover:bg-cucumber-dark text-white font-bold py-2.5 transition-colors text-sm"
            >
              저장하기
            </button>
            <Link
              href="/"
              className="rounded-xl border border-bark-soft bg-cream/40 text-soil font-bold px-5 py-2.5 hover:bg-bark-soft/40 transition-colors text-sm flex items-center"
            >
              취소
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
