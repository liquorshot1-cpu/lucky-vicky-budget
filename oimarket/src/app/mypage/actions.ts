"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getAvatarStoragePath(url: string): string | null {
  const marker = "/avatars/";
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : null;
}

// ── 내 프로필 저장(닉네임/자기소개/사진) ──
export async function updateProfile(formData: FormData) {
  const nickname = getString(formData, "nickname") || "농부";
  const bio = getString(formData, "bio");
  const avatar_url = getString(formData, "avatar_url") || null;

  if (nickname.length > 20) {
    redirect("/mypage?error=" + encodeURIComponent("닉네임은 20자까지 쓸 수 있어요."));
  }
  if (bio.length > 300) {
    redirect("/mypage?error=" + encodeURIComponent("자기소개는 300자까지 쓸 수 있어요."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?message=" + encodeURIComponent("로그인이 필요해요. 🌱"));
  }

  // 사진이 바뀌었으면 이전 사진을 Storage에서 지우기 위해 기존 값 조회
  const { data: oldProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    nickname,
    bio: bio || null,
    avatar_url,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect("/mypage?error=" + encodeURIComponent("저장 실패: " + error.message));
  }

  // 닉네임을 로그인 정보(메타데이터)에도 맞춰 둠 (홈 인사말 등에서 사용)
  await supabase.auth.updateUser({ data: { nickname } });

  // 사진이 바뀌었으면 이전 사진 파일 삭제
  if (oldProfile?.avatar_url && oldProfile.avatar_url !== avatar_url) {
    const path = getAvatarStoragePath(oldProfile.avatar_url);
    if (path) await supabase.storage.from("avatars").remove([path]);
  }

  revalidatePath("/", "layout");
  redirect("/mypage?saved=1");
}
