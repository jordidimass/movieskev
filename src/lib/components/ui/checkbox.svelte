<script>
  import { cn } from "$lib/utils";
  export let className = "";
  export let checked = false;
</script>

<input
  bind:checked
  type="checkbox"
  class={cn(
    "h-5 w-5 rounded border border-white/20 bg-white/10 accent-pink-600",
    className,
  )}
  {...$$restProps}
/>
