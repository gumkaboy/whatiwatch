"use client";

import { useState } from "react";
import type { TmdbEpisode } from "@/lib/tmdb";
import { tmdbImageUrl } from "@/lib/tmdb";
import { toggleEpisodeWatched } from "@/app/actions";

const PAGE_SIZE = 8;

export function EpisodeRow({
  tmdbId,
  seasonNumber,
  episodes,
  watchedEpisodeNumbers,
  fallbackImagePath,
}: {
  tmdbId: number;
  seasonNumber: number;
  episodes: TmdbEpisode[];
  watchedEpisodeNumbers: number[];
  fallbackImagePath: string | null;
}) {
  const [page, setPage] = useState(0);
  const [watchedSet, setWatchedSet] = useState(() => new Set(watchedEpisodeNumbers));

  if (episodes.length === 0) return null;

  const totalPages = Math.ceil(episodes.length / PAGE_SIZE);
  const visible = episodes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const hasPrev = page > 0;
  const hasMore = page < totalPages - 1;

  function toggleWatched(episodeNumber: number) {
    setWatchedSet((prev) => {
      const next = new Set(prev);
      if (next.has(episodeNumber)) next.delete(episodeNumber);
      else next.add(episodeNumber);
      return next;
    });

    toggleEpisodeWatched(tmdbId, seasonNumber, episodeNumber).catch(() => {
      // не удалось сохранить — откатываем оптимистичное обновление
      setWatchedSet((prev) => {
        const next = new Set(prev);
        if (next.has(episodeNumber)) next.delete(episodeNumber);
        else next.add(episodeNumber);
        return next;
      });
    });
  }

  return (
    <div className="episode-row-wrap">
      <div className="episode-row">
        {visible.map((ep, i) => {
          const isUnaired = !ep.air_date || new Date(ep.air_date) > new Date();
          const still = isUnaired ? null : tmdbImageUrl(ep.still_path ?? fallbackImagePath, "w300");
          const isFirst = i === 0;
          const isLast = i === visible.length - 1;
          const isWatched = watchedSet.has(ep.episode_number);
          return (
            <div key={ep.id} className="episode-card" data-watched={isWatched}>
              <div className="episode-thumb-wrap">
                {still ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={still} alt={ep.name} className="episode-thumb" />
                ) : isUnaired ? (
                  <div className="episode-thumb episode-thumb-unaired">
                    Скоро
                    <br />
                    выходит
                  </div>
                ) : (
                  <div className="episode-thumb episode-thumb-placeholder" />
                )}
                {!isUnaired && ep.runtime != null && (
                  <span className="episode-runtime">{ep.runtime} мин</span>
                )}
                {!isUnaired && (
                  <button
                    type="button"
                    className="episode-watch-toggle"
                    data-watched={isWatched}
                    aria-label={
                      isWatched ? "Снять отметку просмотра" : "Отметить серию просмотренной"
                    }
                    onClick={() => toggleWatched(ep.episode_number)}
                  >
                    👁
                  </button>
                )}

                {isFirst && hasPrev && (
                  <button
                    type="button"
                    className="episode-nav episode-nav-prev"
                    aria-label="Показать предыдущие серии"
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ‹
                  </button>
                )}

                {isLast && hasMore && (
                  <button
                    type="button"
                    className="episode-nav episode-nav-next"
                    aria-label="Показать ещё серии"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    ›
                  </button>
                )}
              </div>
              <div className="episode-title">
                {ep.episode_number}. {ep.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
