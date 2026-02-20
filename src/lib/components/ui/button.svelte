<script>
  import { cva } from "class-variance-authority";
  import { cn } from "$lib/utils";

  export let variant = "default";
  export let size = "default";
  export let className = "";

  const buttonVariants = cva(
    "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50",
    {
      variants: {
        variant: {
          default:
            "bg-gradient-to-r from-fuchsia-700 to-pink-600 text-white shadow-lg shadow-pink-800/30 hover:brightness-110",
          ghost:
            "border border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
          outline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
        },
        size: {
          default: "h-10 px-4 py-2",
          sm: "h-9 rounded-md px-3",
          lg: "h-11 rounded-xl px-8",
          icon: "h-10 w-10",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    },
  );
</script>

<button
  class={cn(buttonVariants({ variant, size }), className)}
  on:click
  on:focus
  on:blur
  {...$$restProps}
>
  <slot />
</button>
