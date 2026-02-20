<script>
  import { slide } from "svelte/transition";
  import Input from "$ui/input.svelte";
  import Button from "$ui/button.svelte";
  import Select from "$ui/select.svelte";
  import SlidersHorizontal from "$ui/sliders-horizontal.svelte";
  import CircularProgress from "$ui/circular-progress.svelte";
  import { slugifyTitle } from "$lib/utils/slug";

  export let data;

  let query = "";
  let language = "en-US";
  let region = "";
  let year = "";
  let sortRating = "desc";
  let panelOpen = false;

  function buildSearchUrl() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("find", query.trim());
    if (language) params.set("language", language);
    if (region) params.set("region", region);
    if (year) params.set("year", year);
    if (sortRating) params.set("sortRating", sortRating);
    return `/?${params.toString()}`;
  }
</script>

<div class="fixed inset-0 z-0 opacity-25 mix-blend-soft-light" style="background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='1' height='1' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E')"></div>

<header class="shell relative z-10 py-8 sm:py-10">
  <nav class="glass sticky top-4 z-40 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
    <a class="text-3xl font-semibold tracking-[0.14em]" href="/">MOVIES<span class="text-pink-600">KEV</span></a>
    <form class="relative w-full sm:max-w-3xl" action={buildSearchUrl()}>
      <div class="flex gap-2 sm:gap-3">
        <Input bind:value={query} name="find" placeholder="Search movies or talent" autocomplete="off" className="h-11" />
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-11 rounded-full border-0 bg-white/5 p-0 hover:bg-white/15"
          on:click={() => (panelOpen = !panelOpen)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={18} active={panelOpen} className="opacity-95" />
        </Button>
        <Button type="submit">Search</Button>
      </div>
      {#if panelOpen}
        <div transition:slide={{ duration: 220 }} class="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div class="flex gap-4 overflow-x-auto pb-1">
            <label class="min-w-[180px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Language</span><Select bind:value={language}><option value="en-US">English (US)</option><option value="es-ES">Espanol (ES)</option><option value="es-MX">Espanol (MX)</option><option value="fr-FR">Francais</option></Select></label>
            <label class="min-w-[180px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Region</span><Select bind:value={region}><option value="">Worldwide</option><option value="US">United States</option><option value="ES">Spain</option><option value="MX">Mexico</option><option value="GB">United Kingdom</option></Select></label>
            <label class="min-w-[180px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Year</span><Input bind:value={year} type="number" min="1900" max="2099" className="rounded-xl" /></label>
            <label class="min-w-[220px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Sort by rating</span><Select bind:value={sortRating}><option value="desc">Highest first</option><option value="asc">Lowest first</option></Select></label>
          </div>
        </div>
      {/if}
    </form>
  </nav>

  <section class="glass mt-6 grid gap-8 p-6 lg:grid-cols-[minmax(280px,420px)_1fr] lg:p-8">
    <div class="aspect-[2/3] min-h-[420px] rounded-2xl bg-cover bg-center" style={`background-image:url(https://image.tmdb.org/t/p/original${data.movie.poster_path})`}></div>
    <div class="flex flex-col justify-center gap-4">
      <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Feature film</p>
      <h1 class="text-4xl font-semibold sm:text-5xl">{data.movie.original_title}</h1>
      <div class="flex flex-wrap items-center gap-5 text-sm text-zinc-300">
        {#if data.movie.vote_average}
          <div class="flex items-center gap-3">
            <CircularProgress value={data.movie.vote_average} max={10} size={56} stroke={7} />
            <span class="text-xs uppercase tracking-[0.22em] text-zinc-400">TMDB score</span>
          </div>
        {/if}
        {#if data.movie.release_date}<span>Released {data.movie.release_date}</span>{/if}
        {#if data.movie.runtime}<span>{data.movie.runtime} min</span>{/if}
      </div>
      {#if data.movie.overview}<p class="text-zinc-300">{data.movie.overview}</p>{/if}
    </div>
  </section>
</header>

<main class="shell relative z-10 pb-16">
  <section class="glass p-6">
    <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Cast</p>
    <h2 class="mt-1 text-3xl font-semibold">Lead talent</h2>
    {#if data.cast.length}
      <div class="mt-6 grid grid-flow-col gap-6 overflow-auto pb-2">
        {#each data.cast as member}
          <article class="w-[200px] text-center">
            <a href={`/actor/${slugifyTitle(member.name)}?id=${member.id}`}>
              <img class="h-[300px] w-full rounded-2xl object-cover" src={member.profile_path ? `https://image.tmdb.org/t/p/w400${member.profile_path}` : "/img/guest.jpg"} alt={`Portrait of ${member.name}`} />
            </a>
            <p class="mt-3 text-sm">{member.name}</p>
          </article>
        {/each}
      </div>
    {:else}
      <div class="mt-6 rounded-xl border border-dashed border-white/20 p-6 text-zinc-400">Cast information is not available.</div>
    {/if}
  </section>
</main>
