# Ancestro Web

Welcome to **Ancestro**, a modern solar energy and electric vehicle platform for Latin America.

## 🌍 Internationalization (i18n)

This project supports 5 languages with a fully typed translation system:

- 🇪🇸 **Spanish (es)** - Default language
- 🇺🇸 **English (en)**
- 🇧🇷 **Portuguese (pt)**
- 🇨🇳 **Chinese (zh)**
- 🇸🇦 **Arabic (ar)**

### Translation System Architecture

The i18n system is organized in `src/i18n/`:

```
src/i18n/
├── languages.ts      # Language configuration
├── translations.ts   # All translation keys (130+ keys)
├── utils.ts         # Translation utilities
└── config.ts        # Route configuration
```

### Adding New Translations

1. **Add translation keys** to `src/i18n/translations.ts`:

```typescript
export const translations = {
  es: {
    'your.new.key': 'Tu texto en español',
  },
  en: {
    'your.new.key': 'Your text in English',
  },
  // ... add for all languages
}
```

2. **Use in components**:

```astro
---
import { useTranslations, getLangFromUrl } from '../i18n/utils';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---

<h1>{t('your.new.key')}</h1>
```

### Validation

Run the translation validation script to ensure all keys exist in all languages:

```bash
npm run validate-translations
```

This will:
- ✅ Check that all languages have the same keys
- ⚠️  Report missing or extra keys
- 🔍 Detect duplicate translation values

### URL Structure

- Default language (Spanish): `example.com/`
- Other languages: `example.com/{lang}/`

Examples:
- `example.com/` → Spanish homepage
- `example.com/en/` → English homepage
- `example.com/presale` → Spanish presale page
- `example.com/en/presale` → English presale page

### Translation Coverage

Current coverage: **100%** ✅

All pages and components are fully translated:
- ✅ Navigation & Footer
- ✅ Homepage
- ✅ Presale page (benefits, FAQ, tokenomics, staking tiers)
- ✅ Metadata (titles, descriptions)
- ✅ Accessibility labels (ARIA)

### Best Practices

1. **Never hardcode text** - Always use translation keys
2. **Keep keys organized** - Use namespacing like `nav.*`, `presale.*`, `meta.*`
3. **Validate before committing** - Run `npm run validate-translations`
4. **Use meaningful keys** - `hero.title` is better than `text1`
5. **Add context in comments** - Help translators understand usage

### Adding a New Language

1. Add language to `src/i18n/languages.ts`:

```typescript
export const languages = {
  // ... existing languages
  fr: { name: 'Français', flag: '🇫🇷', code: 'fr' },
}
```

2. Add all translation keys to `src/i18n/translations.ts`
3. Run `npm run validate-translations` to verify
4. Test the new language routes

## 🚀 Project Structure

```text
/
├── public/
│   ├── images/         # Static images
│   ├── logo.svg        # Logo
│   └── MAPA.svg        # LATAM map
├── src/
│   ├── components/     # Astro components
│   │   ├── presale/    # Presale page components
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   └── ...
│   ├── i18n/           # Internationalization
│   │   ├── languages.ts
│   │   ├── translations.ts
│   │   ├── utils.ts
│   │   └── config.ts
│   ├── layouts/        # Page layouts
│   │   └── Layout.astro
│   ├── pages/          # Routes
│   │   ├── [lang]/     # Localized routes
│   │   │   ├── index.astro
│   │   │   ├── presale.astro
│   │   │   └── waitlist.astro
│   │   ├── index.astro
│   │   ├── presale.astro
│   │   └── waitlist.astro
│   ├── scripts/        # Utility scripts
│   │   └── validate-translations.ts
│   └── stores/         # State management (nanostores)
│       └── language.ts
├── astro.config.mjs    # Astro configuration
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run validate-translations` | Validate translation completeness         |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📦 Tech Stack

- **Framework**: [Astro](https://astro.build) 5.17.1
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores) 1.1.0
- **Persistence**: [@nanostores/persistent](https://github.com/nanostores/persistent) 1.3.0
- **Sitemap**: [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) 3.7.0
- **TypeScript**: Fully typed
- **i18n**: Custom implementation with type safety

## 🌐 Pages

- **Homepage** (`/`, `/{lang}/`): Main landing page with hero, solar subscription info, LATAM network
- **Presale** (`/presale`, `/{lang}/presale`): ANC token presale with benefits, tokenomics, FAQ
- **Waitlist** (`/waitlist`, `/{lang}/waitlist`): Sign up for early access

## 🎨 Design System

The project uses a custom design system with:

- **Colors**: Primary gold (`#f8b03b`), dark backgrounds
- **Typography**: Custom font stack with fallbacks
- **Components**: Modular, reusable Astro components
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Responsive**: Mobile-first design with breakpoints at 768px, 480px

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the site
npm run build

# Preview the build
npm run preview
```

### Translation Workflow

1. Make changes to `src/i18n/translations.ts`
2. Run `npm run validate-translations` to verify
3. Test in browser with language switcher
4. Commit changes

## 📝 Contributing

When contributing translations:

1. Add keys to ALL languages in `translations.ts`
2. Run validation script before committing
3. Test all language routes work correctly
4. Follow the existing key naming conventions

## 📄 License

[Add your license here]

## 👀 Learn More

- [Astro Documentation](https://docs.astro.build)
- [Nanostores Documentation](https://github.com/nanostores/nanostores)
- [Project Website](https://ancestro.com) (placeholder)
