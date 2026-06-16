"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// 폼 입력값을 안전하게 문자열로 꺼내는 헬퍼
function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ── 로그인 ──
export async function login(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("이메일과 비밀번호를 입력해 주세요."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=" + encodeURIComponent("로그인 실패: 이메일 또는 비밀번호를 확인해 주세요."));
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// ── 회원가입 ──
export async function signup(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const nickname = getString(formData, "nickname");

  if (!email || !password) {
    redirect("/signup?error=" + encodeURIComponent("이메일과 비밀번호를 입력해 주세요."));
  }
  if (password.length < 6) {
    redirect("/signup?error=" + encodeURIComponent("비밀번호는 6자 이상이어야 해요."));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 닉네임은 사용자 메타데이터에 저장(권한 판단엔 사용하지 않음)
      data: { nickname: nickname || "농부" },
    },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent("회원가입 실패: " + error.message));
  }

  // 이메일 인증이 켜져 있으면 session이 없습니다.
  if (!data.session) {
    redirect("/login?message=" + encodeURIComponent("확인 메일을 보냈어요! 메일에서 인증 후 로그인해 주세요. 🌱"));
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// ── 로그아웃 ──
export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
