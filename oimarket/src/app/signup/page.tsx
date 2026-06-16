import Link from "next/link";
import { signup } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-2xl font-black text-cucumber-dark">오이마켓</h1>
          <p className="text-sm text-soil-soft mt-1">우리 동네 텃밭 직거래</p>
        </Link>

        <div className="bg-paper rounded-3xl shadow-sm border border-bark-soft p-7">
          <h2 className="text-lg font-bold mb-5 text-soil">새 농부 등록하기 🧑‍🌾</h2>

          {error && (
            <p className="mb-4 text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3">
              {error}
            </p>
          )}

          <form action={signup} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-soil-soft mb-1">
                닉네임 (농부 이름)
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="텃밭지기"
                className="w-full rounded-xl border border-bark-soft bg-cream/40 px-4 py-2.5 text-soil outline-none focus:border-cucumber focus:ring-2 focus:ring-leaf-soft"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-soil-soft mb-1">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="farmer@oimarket.com"
                className="w-full rounded-xl border border-bark-soft bg-cream/40 px-4 py-2.5 text-soil outline-none focus:border-cucumber focus:ring-2 focus:ring-leaf-soft"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-soil-soft mb-1">
                비밀번호{" "}
                <span className="text-xs text-soil-soft/70">(6자 이상)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl border border-bark-soft bg-cream/40 px-4 py-2.5 text-soil outline-none focus:border-cucumber focus:ring-2 focus:ring-leaf-soft"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-cucumber hover:bg-cucumber-dark text-white font-bold py-3 transition-colors"
            >
              씨앗 심기 (가입하기)
            </button>
          </form>

          <p className="text-center text-sm text-soil-soft mt-5">
            이미 농부이신가요?{" "}
            <Link href="/login" className="font-bold text-cucumber-dark hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
