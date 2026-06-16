"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/products/actions";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("정말로 이 판매글을 삭제할까요? 되돌릴 수 없어요.")) return;
    startTransition(() => deleteProduct(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex-1 rounded-xl border border-red-200 text-red-500 font-bold py-2.5 hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
    >
      {isPending ? "삭제 중…" : "🗑️ 삭제"}
    </button>
  );
}
