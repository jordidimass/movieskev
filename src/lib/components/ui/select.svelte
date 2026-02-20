<script>
  import { cn } from "$lib/utils";
  export let className = "";
  export let value = "";
</script>

<select
  bind:value
  class={cn(
    "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
    className,
  )}
  {...$$restProps}
>
  <slot />
</select>
