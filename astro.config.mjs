// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  site: 'https://ancestro.com',
  
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'pt', 'zh', 'ar'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  
  integrations: [sitemap({
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
  }), react()],
  
  build: {
    inlineStylesheets: 'auto'
  },
  
  server: {
    host: '0.0.0.0',
    port: 4321,
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