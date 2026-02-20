import { json } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";

export async function GET({ url }) {
  const find = (url.searchParams.get("find") || "").trim();
  const language = (url.searchParams.get("language") || "en-US").trim() || "en-US";
  const region = (url.searchParams.get("region") || "").trim();
  const year = (url.searchParams.get("year") || "").trim();
  const sortRating = url.searchParams.get("sortRating") === "asc" ? "asc" : "desc";

  if (!find) {
    return json({ results: [] });
  }

  try {
    const data = await tmdbFetch("/search/movie", {
      query: find,
      language,
      region,
      primary_release_year: year,
    });

    const sortedResults = [...(data.results || [])].sort((a, b) => {
      const diff = (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0);
      return sortRating === "asc" ? -diff : diff;
    });

    return json({ results: sortedResults });
  } catch {
    return json({ results: [] }, { status: 200 });
  }
}
