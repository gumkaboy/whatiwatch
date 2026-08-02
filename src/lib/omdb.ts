const OMDB_BASE_URL = "https://www.omdbapi.com/";

interface OmdbResponse {
  Response: "True" | "False";
  imdbRating?: string;
  imdbVotes?: string;
}

export interface ImdbRating {
  rating: number;
  votes: string;
}

export async function getImdbRating(imdbId: string): Promise<ImdbRating | null> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return null;

  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("i", imdbId);

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const data = (await res.json()) as OmdbResponse;
  if (data.Response !== "True" || !data.imdbRating || data.imdbRating === "N/A") {
    return null;
  }

  return {
    rating: Number(data.imdbRating),
    votes: data.imdbVotes ?? "0",
  };
}
