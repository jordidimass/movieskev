export function slugifyTitle(value) {
  return String(value || "movie")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function unslugifyTitle(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .trim();
}
