import adapter from "@sveltejs/adapter-vercel";

const config = {
  kit: {
    adapter: adapter({ runtime: "nodejs20.x" }),
    alias: {
      $components: "src/lib/components",
      $ui: "src/lib/components/ui",
    },
  },
};

export default config;
