<script>
  import { cn } from "$lib/utils";
  export let className = "";
  export let value = "";
  export let type = "text";
</script>

<input
  bind:value
  {type}
  class={cn(
    "flex h-11 w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
    className,
  )}
  {...$$restProps}
/>
