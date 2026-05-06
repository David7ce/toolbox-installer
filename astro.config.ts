import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://david7ce.github.io',
  base: '/toolbox-installer',
  output: 'static',
  build: {
    format: 'file',
  },
});
