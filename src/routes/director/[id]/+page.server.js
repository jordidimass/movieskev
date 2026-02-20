import { error } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";
import { unslugifyTitle } from "$lib/utils/slug";

export async function load({ params, url }) {
  const idFromQuery = Number(url.searchParams.get("id"));
  const idFromPath = Number(params.id);
  let personId = null;

  if (Number.isFinite(idFromQuery) && idFromQuery > 0) {
    personId = idFromQuery;
  } else if (Number.isFinite(idFromPath) && idFromPath > 0) {
    personId = idFromPath;
  } else {
    try {
      const query = unslugifyTitle(params.id);
      if (!query) {
        throw error(404, "Director not found");
      }

      const people = await tmdbFetch("/search/person", {
        query,
        language: "en-US",
        include_adult: false,
      });

      const match =
        (people.results || []).find((person) => person.known_for_department === "Directing") ||
        people.results?.[0];

      if (!match?.id) {
        throw error(404, "Director not found");
      }

      personId = match.id;
    } catch {
      throw error(404, "Director not found");
    }
  }

  try {
    const [person, movies] = await Promise.all([
      tmdbFetch(`/person/${personId}`),
      tmdbFetch(`/person/${personId}/movie_credits`),
    ]);

    const directedMovies = Array.from(
      new Map(
        (movies.crew || [])
          .filter((movie) => movie.job === "Director")
          .sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""))
          .map((movie) => [movie.id, movie])
      ).values()
    );

    return {
      person,
      filmography: directedMovies,
    };
  } catch {
    throw error(404, "Director not found");
  }
}
