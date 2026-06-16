"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from "@/app/products/actions";

export type Comment = {
  id: string;
  parent_id: string | null;
  author_nickname: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  user_id: string;
  like_count: number;
  liked_by_me: boolean;
};

interface CommentSectionProps {
  productId: string;
  comments: Comment[];
  currentUserId: string | null;
  isLoggedIn: boolean;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export default function CommentSection({
  productId,
  comments,
  currentUserId,
  isLoggedIn,
}: CommentSectionProps) {
  const router = useRouter();

  // 부모 댓글과 대댓글로 나누기
  const topLevel = comments.filter((c) => c.parent_id === null);
  const repliesByParent: Record<string, Comment[]> = {};
  for (const c of comments) {
    if (c.parent_id) {
      (repliesByParent[c.parent_id] ??= []).push(c);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-sm font-black text-soil mb-3 flex items-center gap-1.5">
        💬 댓글
        <span className="text-cucumber-dark">{comments.length}</span>
      </h2>

      {/* 새 댓글 작성칸 */}
      {isLoggedIn ? (
        <CommentForm productId={productId} parentId={null} placeholder="따뜻한 댓글을 남겨보세요 🌱" />
      ) : (
        <button
          onClick={() =>
            router.push(
              "/login?message=" +
                encodeURIComponent("댓글을 쓰려면 로그인해 주세요. 🌱"),
            )
          }
          className="w-full text-left text-sm text-soil-soft/70 bg-paper border border-bark-soft rounded-xl px-4 py-3 hover:border-cucumber transition-colors"
        >
          로그인하고 댓글 남기기 →
        </button>
      )}

      {/* 댓글 목록 */}
      {topLevel.length === 0 ? (
        <p className="text-center text-sm text-soil-soft/60 py-8">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <ul className="mt-5 space-y-5">
          {topLevel.map((c) => (
            <li key={c.id}>
              <CommentItem
                comment={c}
                productId={productId}
                currentUserId={currentUserId}
                isLoggedIn={isLoggedIn}
                isReply={false}
              />

              {/* 대댓글 목록 */}
              {(repliesByParent[c.id] ?? []).length > 0 && (
                <ul className="mt-3 ml-5 pl-4 border-l-2 border-bark-soft/60 space-y-3">
                  {repliesByParent[c.id].map((r) => (
                    <li key={r.id}>
                      <CommentItem
                        comment={r}
                        productId={productId}
                        currentUserId={currentUserId}
                        isLoggedIn={isLoggedIn}
                        isReply={true}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── 댓글 한 개 (본문 + 좋아요 + 답글 + 수정 + 삭제) ──
function CommentItem({
  comment,
  productId,
  currentUserId,
  isLoggedIn,
  isReply,
}: {
  comment: Comment;
  productId: string;
  currentUserId: string | null;
  isLoggedIn: boolean;
  isReply: boolean;
}) {
  const router = useRouter();
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  // 좋아요 (낙관적 업데이트)
  const [liked, setLiked] = useState(comment.liked_by_me);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [isLiking, startLike] = useTransition();

  const isMine = currentUserId === comment.user_id;

  function handleDelete() {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    startDelete(async () => {
      await deleteComment(comment.id, productId);
    });
  }

  function handleLike() {
    if (!isLoggedIn) {
      router.push(
        "/login?message=" +
          encodeURIComponent("좋아요를 누르려면 로그인해 주세요. 🌱"),
      );
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    startLike(async () => {
      const result = await toggleCommentLike(comment.id, productId);
      if ("error" in result) {
        setLiked(comment.liked_by_me);
        setLikeCount(comment.like_count);
      } else {
        setLiked(result.liked);
        setLikeCount(result.count);
      }
    });
  }

  return (
    <div className={isDeleting ? "opacity-50" : ""}>
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 w-8 h-8 rounded-full bg-bark-soft flex items-center justify-center text-base">
          🧑‍🌾
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-soil">{comment.author_nickname}</span>
            <span className="text-[11px] text-soil-soft/50">
              {timeAgo(comment.created_at)}
              {comment.edited_at && " (수정됨)"}
            </span>
          </div>

          {/* 본문 또는 수정칸 */}
          {isEditing ? (
            <div className="mt-1.5">
              <CommentForm
                productId={productId}
                parentId={comment.parent_id}
                placeholder="댓글을 수정하세요"
                mode="edit"
                commentId={comment.id}
                initialValue={comment.content}
                onDone={() => setIsEditing(false)}
                onCancel={() => setIsEditing(false)}
                autoFocus
              />
            </div>
          ) : (
            <p className="text-sm text-soil leading-relaxed whitespace-pre-wrap mt-0.5 break-words">
              {comment.content}
            </p>
          )}

          {/* 액션: 좋아요 / 답글 / 수정 / 삭제 */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-1.5">
              {/* 좋아요 */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                aria-label={liked ? "좋아요 취소" : "좋아요"}
                className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                  liked ? "text-red-400" : "text-soil-soft/70 hover:text-red-400"
                } ${isLiking ? "opacity-60" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>

              {!isReply && isLoggedIn && (
                <button
                  onClick={() => setShowReply((v) => !v)}
                  className="text-[11px] font-medium text-soil-soft/70 hover:text-cucumber-dark transition-colors"
                >
                  {showReply ? "취소" : "답글"}
                </button>
              )}
              {isMine && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] font-medium text-soil-soft/70 hover:text-cucumber-dark transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-[11px] font-medium text-soil-soft/70 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          )}

          {/* 답글(대댓글) 작성칸 */}
          {showReply && !isEditing && (
            <div className="mt-3">
              <CommentForm
                productId={productId}
                parentId={comment.id}
                placeholder={`${comment.author_nickname}님에게 답글 달기`}
                onDone={() => setShowReply(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 댓글/답글 입력 폼 (작성 + 수정 공용) ──
function CommentForm({
  productId,
  parentId,
  placeholder,
  onDone,
  onCancel,
  autoFocus,
  mode = "create",
  commentId,
  initialValue = "",
}: {
  productId: string;
  parentId: string | null;
  placeholder: string;
  onDone?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  mode?: "create" | "edit";
  commentId?: string;
  initialValue?: string;
}) {
  const [content, setContent] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setError(null);

    startTransition(async () => {
      const result =
        mode === "edit" && commentId
          ? await updateComment(commentId, productId, text)
          : await createComment(productId, parentId, text);

      if ("error" in result) {
        setError(result.error);
      } else {
        if (mode === "create") setContent("");
        onDone?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={parentId && mode === "create" ? 1 : 2}
          autoFocus={autoFocus}
          className="flex-1 resize-none rounded-xl border border-bark-soft bg-paper px-3 py-2 text-sm text-soil placeholder:text-soil-soft/50 focus:border-cucumber focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="shrink-0 rounded-xl bg-cucumber hover:bg-cucumber-dark text-white font-bold text-sm px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "…" : mode === "edit" ? "저장" : "등록"}
        </button>
        {mode === "edit" && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 rounded-xl border border-bark-soft text-soil-soft font-medium text-sm px-3 py-2 hover:bg-bark-soft/40 transition-colors"
          >
            취소
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </form>
  );
}
