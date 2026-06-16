import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Next.js 16부터 Middleware는 Proxy로 이름이 바뀌었습니다(기능은 동일).
// 매 요청마다 Supabase 인증 토큰을 갱신합니다.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 정적 파일과 이미지 최적화 경로를 제외한 모든 요청에 적용
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
