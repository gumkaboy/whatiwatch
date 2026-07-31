import type { NextRequest } from "next/server";

const ALLOWED_SIZES = new Set(["w92", "w200", "w300", "w342", "w500", "original"]);
const PATH_PATTERN = /^\/[A-Za-z0-9]+\.(jpg|png)$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size");
  const path = searchParams.get("path");

  if (!size || !ALLOWED_SIZES.has(size) || !path || !PATH_PATTERN.test(path)) {
    return new Response("Invalid parameters", { status: 400 });
  }

  const upstream = await fetch(`https://image.tmdb.org/t/p/${size}${path}`, {
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
