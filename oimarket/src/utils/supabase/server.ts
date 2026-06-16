import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버(서버 컴포넌트 / 서버 액션 / 라우트 핸들러)에서 사용하는 Supabase 클라이언트.
// 요청마다 새로 만들어야 하므로 async 함수로 둡니다.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서 호출되면 set이 막힐 수 있습니다.
            // 미들웨어가 세션을 갱신해 주므로 무시해도 됩니다.
          }
        },
      },
    },
  );
}
