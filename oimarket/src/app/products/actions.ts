"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CATEGORIES } from "@/app/products/categories";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseProductFields(formData: FormData) {
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const location = getString(formData, "location");
  const image_url = getString(formData, "image_url") || null;

  const categoryInput = getString(formData, "category");
  const category = (CATEGORIES as readonly string[]).includes(categoryInput)
    ? categoryInput
    : "기타";

  const isFree = formData.get("isFree") === "on";
  const priceRaw = getString(formData, "price").replace(/[^0-9]/g, "");
  const price = isFree ? 0 : priceRaw ? parseInt(priceRaw, 10) : 0;

  return { title, description, location, category, price, image_url };
}

function getStoragePath(url: string): string | null {
  const marker = "/product-images/";
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : null;
}

async function deleteStorageImage(supabase: Awaited<ReturnType<typeof createClient>>, url: string | null) {
  if (!url) return;
  const path = getStoragePath(url);
  if (path) {
    await supabase.storage.from("product-images").remove([path]);
  }
}

// ── 판매글 등록 ──
export async function createProduct(formData: FormData) {
  const { title, description, location, category, price, image_url } =
    parseProductFields(formData);

  if (!title) {
    redirect("/sell?error=" + encodeURIComponent("상품 이름을 입력해 주세요."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      "/login?message=" + encodeURIComponent("상품을 등록하려면 먼저 로그인해 주세요. 🌱"),
    );
  }

  const { error } = await supabase.from("products").insert({
    title,
    description: description || null,
    price,
    category,
    location: location || null,
    image_url,
    user_id: user.id,
  });

  if (error) {
    redirect("/sell?error=" + encodeURIComponent("등록 실패: " + error.message));
  }

  revalidatePath("/", "layout");
  redirect("/?registered=1");
}

// ── 판매글 수정 ──
export async function updateProduct(id: string, formData: FormData) {
  const { title, description, location, category, price, image_url } =
    parseProductFields(formData);

  if (!title) {
    redirect(
      `/products/${id}/edit?error=` + encodeURIComponent("상품 이름을 입력해 주세요."),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?message=" + encodeURIComponent("로그인이 필요해요. 🌱"));
  }

  // 기존 이미지 URL 조회 (이미지가 바뀌었으면 Storage에서 삭제하기 위해)
  const { data: oldProduct } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("products")
    .update({
      title,
      description: description || null,
      price,
      category,
      location: location || null,
      image_url,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/products/${id}/edit?error=` + encodeURIComponent("수정 실패: " + error.message),
    );
  }

  // 이미지가 바뀌었으면 이전 이미지를 Storage에서 삭제
  if (oldProduct?.image_url && oldProduct.image_url !== image_url) {
    await deleteStorageImage(supabase, oldProduct.image_url);
  }

  revalidatePath("/products", "layout");
  redirect(`/products/${id}?updated=1`);
}

// ── 판매글 삭제 ──
export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?message=" + encodeURIComponent("로그인이 필요해요. 🌱"));
  }

  // 이미지 URL 미리 가져오기 (삭제 후 Storage 정리용)
  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/products/${id}?error=` + encodeURIComponent("삭제 실패: " + error.message),
    );
  }

  // 상품 삭제 후 이미지도 Storage에서 삭제
  await deleteStorageImage(supabase, product?.image_url ?? null);

  revalidatePath("/products", "layout");
  redirect("/products?deleted=1");
}
