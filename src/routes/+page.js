export function load({ url }) {
  const pageRaw = Number(url.searchParams.get("page") || "1");
  const initialPage = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  return {
    initialQuery: url.searchParams.get("find") || "",
    initialLanguage: url.searchParams.get("language") || "en-US",
    initialRegion: url.searchParams.get("region") || "",
    initialYear: url.searchParams.get("year") || "",
    initialSortRating: url.searchParams.get("sortRating") === "asc" ? "asc" : "desc",
    initialGenre: url.searchParams.get("genre") || "",
    initialPage,
  };
}
