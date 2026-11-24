import { defineConfig } from 'astro/config';

export default defineConfig({
  // Output estático (padrão) — gera HTML puro
  output: 'static',

  // View Transitions habilitadas
  prefetch: true,

  // Build otimizado
  build: {
    // Inline do CSS no HTML: elimina a requisição de CSS que bloqueia a renderização
    inlineStylesheets: 'always',
  },

  // Dev server
  server: {
    port: 4321,
  },
});
