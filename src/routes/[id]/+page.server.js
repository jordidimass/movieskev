import { error } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";

export async function load({ params }) {
  try {
    const [movie, credits, videos] = await Promise.all([
      tmdbFetch(`/movie/${params.id}`),
      tmdbFetch(`/movie/${params.id}/credits`),
      tmdbFetch(`/movie/${params.id}/videos`, { language: "en-US" }),
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
