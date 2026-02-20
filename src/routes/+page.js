export function load({ url }) {
  return {
    initialQuery: url.searchParams.get("find") || "",
    initialLanguage: url.searchParams.get("language") || "en-US",
    initialRegion: url.searchParams.get("region") || "",
    initialYear: url.searchParams.get("year") || "",
    initialSortRating: url.searchParams.get("sortRating") === "asc" ? "asc" : "desc",
    initialGenre: url.searchParams.get("genre") || "",
  };
}
