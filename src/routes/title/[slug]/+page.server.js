import { error } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";
import { unslugifyTitle } from "$lib/utils/slug";

export async function load({ params, url }) {
  const idFromQuery = Number(url.searchParams.get("id"));
  let movieId = Number.isFinite(idFromQuery) && idFromQuery > 0 ? idFromQuery : null;

  if (!movieId) {
    const query = unslugifyTitle(params.slug);

    if (!query) {
      throw error(404, "Movie not found");
    }

    const search = await tmdbFetch("/search/movie", {
      query,
      language: "en-US",
      include_adult: false,
    });

    const firstMatch = search.results?.[0];
    if (!firstMatch?.id) {
      throw error(404, "Movie not found");
    }

    movieId = firstMatch.id;
  }

  try {
    const [movie, credits] = await Promise.all([
      tmdbFetch(`/movie/${movieId}`),
      tmdbFetch(`/movie/${movieId}/credits`),
    ]);

    return {
      movie,
      cast: credits.cast || [],
    };
  } catch {
    throw error(404, "Movie not found");
  }
}
