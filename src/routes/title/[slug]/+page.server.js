import { error } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";
import { unslugifyTitle } from "$lib/utils/slug";

export async function load({ params, url }) {
  const idFromQuery = Number(url.searchParams.get("id"));
  let movieId = Number.isFinite(idFromQuery) && idFromQuery > 0 ? idFromQuery : null;

  if (!movieId) {
    try {
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
    } catch {
      throw error(404, "Movie not found");
    }
  }

  try {
    const [movie, credits, videos] = await Promise.all([
      tmdbFetch(`/movie/${movieId}`),
      tmdbFetch(`/movie/${movieId}/credits`),
      tmdbFetch(`/movie/${movieId}/videos`, { language: "en-US" }),
    ]);

    const youtubeVideos = (videos.results || []).filter((item) => item.site === "YouTube" && item.key);
    const trailer =
      youtubeVideos.find((item) => item.type === "Trailer" && item.official) ||
      youtubeVideos.find((item) => item.type === "Trailer") ||
      youtubeVideos[0];

    return {
      movie,
      cast: credits.cast || [],
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
    };
  } catch {
    throw error(404, "Movie not found");
  }
}
