import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 매 요청마다 만료된 인증 토큰을 갱신하고, 갱신된 쿠키를
// 브라우저와 서버 컴포넌트 양쪽에 전달하는 역할을 합니다.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims()는 JWT 서명을 검증하므로 서버에서 신뢰할 수 있습니다.
  // 이 호출 사이에 다른 로직을 넣지 마세요(토큰 갱신 타이밍이 깨질 수 있음).
  try {
    await supabase.auth.getClaims();
  } catch {
    // Supabase 연결 오류 시 503 대신 요청을 그냥 통과시킵니다.
  }

  return supabaseResponse;
}
