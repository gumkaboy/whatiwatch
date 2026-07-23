import Link from "next/link";
import type { CSSProperties } from "react";
import { tmdbImageUrl } from "@/lib/tmdb";

export function PosterTile({
  tmdbId,
  name,
  posterPath,
  style,
}: {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  style?: CSSProperties;
}) {
  const poster = tmdbImageUrl(posterPath, "w342");
  if (!poster) return null;

  return (
    <Link href={`/series/${tmdbId}`} className="poster-tile" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt={name} />
    </Link>
  );
}
