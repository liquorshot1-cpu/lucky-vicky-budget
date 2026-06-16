"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/app/products/actions";

interface LikeButtonProps {
  productId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}

export default function LikeButton({
  productId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(
        "/login?message=" + encodeURIComponent("좋아요를 누르려면 로그인해 주세요. 🌱"),
      );
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : c - 1));

    startTransition(async () => {
      const result = await toggleLike(productId);
      if ("error" in result) {
        setLiked(liked);
        setCount(initialCount);
      } else {
        setLiked(result.liked);
        setCount(result.count);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
        liked
          ? "bg-red-50 border-red-300 text-red-500"
          : "bg-paper border-bark-soft text-soil-soft hover:border-red-300 hover:text-red-400"
      } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className={`w-5 h-5 transition-transform ${isPending ? "" : "active:scale-125"}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      <span className="font-semibold text-sm">{count}</span>
    </button>
  );
}
