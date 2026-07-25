"use client";

import { useState } from "react";
import { addComment, deleteComment } from "@/app/actions";

export interface CommentItem {
  id: number;
  text: string;
  createdAt: string;
  authorName: string;
  isOwn: boolean;
}

export function CommentSection({
  tmdbId,
  initialComments,
}: {
  tmdbId: number;
  initialComments: CommentItem[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setPending(true);
    addComment(tmdbId, trimmed)
      .then(() => {
        setText("");
        window.location.reload();
      })
      .catch(() => setPending(false));
  }

  function handleDelete(commentId: number) {
    const prev = comments;
    setComments((c) => c.filter((item) => item.id !== commentId));

    deleteComment(commentId, tmdbId).catch(() => setComments(prev));
  }

  return (
    <div className="comment-section">
      <h2 className="comment-section-title">Обсуждение</h2>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          className="comment-input"
          placeholder="Оставьте комментарий..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <button type="submit" className="comment-submit" disabled={pending || !text.trim()}>
          Отправить
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="comment-empty">Пока нет комментариев. Будьте первым.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment-item">
              <div className="comment-item-header">
                <span className="comment-author">{c.authorName}</span>
                <span className="comment-date">
                  {new Date(c.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <p className="comment-text">{c.text}</p>
              {c.isOwn && (
                <button
                  type="button"
                  className="comment-delete-icon"
                  onClick={() => handleDelete(c.id)}
                  title="Удалить комментарий"
                  aria-label="Удалить комментарий"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon-bin.png" alt="" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
