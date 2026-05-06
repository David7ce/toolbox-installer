import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://david7ce.github.io',
  base: '/toolbox-installer',
  output: 'static',
  build: {
    format: 'file',
  },
  vite: {
    resolve: {
      alias: {
        '@scripts': '/src/scripts',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
      }
    }
  }
});
