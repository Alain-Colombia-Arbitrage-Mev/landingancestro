// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ancestro.com',
  
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-LA',
          en: 'en-US',
          pt: 'pt-BR'
        }
      }
    })
  ],
  
  build: {
    // Inline small CSS for better performance
    inlineStylesheets: 'auto'
  },
  
  vite: {
    build: {
      // Optimize CSS
      cssMinify: true,
      // Split chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Group vendor code
          }
        }
      }
    },
    // Optimize dependencies
    optimizeDeps: {
      exclude: []
    }
  },
  
  // Compress HTML output
  compressHTML: true,
  
  // Prefetch links for faster navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
