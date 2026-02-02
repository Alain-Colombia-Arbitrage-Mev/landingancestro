// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ancestro.com',
  
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'pt', 'zh', 'ar'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  
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
          pt: 'pt-BR',
          zh: 'zh-CN',
          ar: 'ar-SA'
        }
      }
    })
  ],
  
  build: {
    inlineStylesheets: 'auto'
  },
  
  vite: {
    build: {
      cssMinify: true,
    }
  },
  
  compressHTML: true,
  
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
