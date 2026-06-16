import Link from "next/link";
import { login } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  // Next.js 16에서 searchParams는 Promise 입니다.
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* 브랜드 */}
        <Link href="/" className="block text-center mb-8">
          <div className="text-5xl mb-2">🥒</div>
          <h1 className="text-2xl font-black text-cucumber-dark">오이마켓</h1>
          <p className="text-sm text-soil-soft mt-1">우리 동네 텃밭 직거래</p>
        </Link>

        <div className="bg-paper rounded-3xl shadow-sm border border-bark-soft p-7">
          <h2 className="text-lg font-bold mb-5 text-soil">로그인 🚜</h2>

          {message && (
            <p className="mb-4 text-sm rounded-xl bg-leaf-soft text-cucumber-dark px-4 py-3">
              {message}
            </p>
          )}
          {error && (
            <p className="mb-4 text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3">
              {error}
            </p>
          )}

          <form action={login} className="space-y-4">
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
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-bark-soft bg-cream/40 px-4 py-2.5 text-soil outline-none focus:border-cucumber focus:ring-2 focus:ring-leaf-soft"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-cucumber hover:bg-cucumber-dark text-white font-bold py-3 transition-colors"
            >
              밭으로 들어가기
            </button>
          </form>

          <p className="text-center text-sm text-soil-soft mt-5">
            아직 농부가 아니신가요?{" "}
            <Link href="/signup" className="font-bold text-cucumber-dark hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
