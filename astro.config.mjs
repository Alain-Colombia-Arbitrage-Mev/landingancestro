// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  site: 'https://ancestro.ai',
  
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
    filter: (page) =>
      !page.includes('/api/') &&
      !page.includes('/login') &&
      !page.includes('/register') &&
      !page.includes('/verify') &&
      !page.includes('/forgot-password') &&
      !page.includes('/reset-password') &&
      !page.includes('/dashboard') &&
      !page.includes('/invest'),
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