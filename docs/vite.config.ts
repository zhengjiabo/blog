// vite.config.ts
import { SearchPlugin } from "vitepress-plugin-search";
import { defineConfig } from "vite";
import flexSearchIndexOptions from "flexsearch";

//default options
var options = {
  ...flexSearchIndexOptions,
  encode: false,
  tokenize: 'full',
  previewLength: 100,
};

export default defineConfig({
  plugins: [ SearchPlugin(options) ]
});