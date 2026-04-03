# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Retypeset** is a typography-focused static blog theme built on Astro 5. It emphasizes print-inspired aesthetics, multi-language support, and rich content processing. The theme uses Astro Collections for content management with Zod validation.

## Commands

```bash
# Development
pnpm dev          # Start dev server with type checking
pnpm build        # Build with type checking and LQIP generation
pnpm preview      # Preview production build

# Content Management
pnpm new-post     # Create new post with frontmatter template
pnpm format-posts # Format all posts (uses autocorrect)
pnpm apply-lqip   # Generate Low Quality Image Placeholders for images

# Code Quality
pnpm lint         # ESLint checking
pnpm lint:fix     # Auto-fix linting issues
pnpm update-theme # Update the theme (for template users)

# Direct Astro commands
pnpm astro check  # TypeScript checking
```

## Architecture

### Project Structure

```
src/
├── components/           # UI components
│   ├── Comment/          # Comment providers (Giscus, Twikoo, Waline)
│   └── Widgets/          # Interactive widgets (TOC, ImageZoom, CodeCopyButton, etc.)
├── content/              # Astro Collections (content managed by Zod schema)
│   ├── posts/            # Blog posts (.md, .mdx)
│   │   └── _images/      # Post images organized by subdirectory
│   └── about/            # About pages
├── i18n/                 # Internationalization
│   ├── config.ts         # Locale mappings for routing and comments
│   ├── ui.ts             # UI text translations
│   ├── lang.ts           # Language detection utilities
│   └── path.ts           # i18n path helpers
├── layouts/              # Page layouts
│   ├── Layout.astro      # Base layout
│   ├── Head.astro        # Meta tags and head elements
│   └── NewPost.astro     # Blog post layout
├── pages/                # File-based routing
│   ├── [lang]/           # Localized routes (rss.xml, atom.xml)
│   ├── og/               # Open Graph image generation
│   ├── [...index].astro  # Home page (catch-all for i18n)
│   ├── [...posts_slug].astro  # Blog post pages
│   ├── [...about].astro  # About pages
│   ├── [...tags].astro   # Tags listing
│   └── projects.astro    # Projects page
├── plugins/              # Custom remark/rehype plugins for Markdown
├── styles/               # CSS modules
│   ├── global.css        # Global styles
│   ├── markdown.css      # Markdown typography
│   ├── font.css          # Font definitions
│   └── transition.css    # View transition animations
├── types/                # TypeScript type definitions
├── utils/                # Utility functions (content, feed, page helpers)
├── config.ts             # Central theme configuration
└── content.config.ts     # Astro Collections schema (Zod)
```
### Multi-language System
- **Supported locales   **: `de`, `en`, `es`, `fr`, `ja`, `ko`, `pl`, `pt`, `ru`, `zh`, `zh-tw`
- **Routing**: Dynamic routes use `[lang]` prefix (e.g., `/en/`, `/zh/`)
- **Configuration**: Set default locale in [src/config.ts](src/config.ts#L46) (`global.locale`) and additional locales in `global.moreLocales`
- **UI translations**: Edit [src/i18n/ui.ts](src/i18n/ui.ts) for translated interface text
- **Comment i18n**: Locale mappings for Giscus, Twikoo, and Waline in [src/i18n/config.ts](src/i18n/config.ts)

### Content System
- **Posts**: [src/content/posts/](src/content/posts/) - Blog posts with frontmatter validation
- **About pages**: [src/content/about/](src/content/about/) - Static about pages
- **Supported formats**: `.md` and `.mdx`
- **Image organization**: Post images in `src/content/posts/_images/` subdirectories
- **Special frontmatter fields**:
  - `abbrlink`: Short permalink identifier
  - `pin`: Pinned posts display at top of index
  - `toc`: Table of contents (overrides global setting)
  - `lang`: Explicit language for a post
  - `draft`: Hide from production builds

### Theme Configuration
All theme customization goes through [src/config.ts](src/config.ts):
- **Site metadata**: Title, subtitle, author, URL, favicon
- **Colors**: oklch color spaces for light/dark modes (`color.light`, `color.dark`)
- **Global settings**: Locale, font style (sans/serif), date format, KaTeX, TOC
- **Comment system**: Choose from Giscus (GitHub), Twikoo, or Waline
- **SEO**: Analytics IDs, search verification, Open Graph
- **Footer**: Social links and start year

### Markdown Processing Pipeline
Custom remark/rehype plugins in [src/plugins/](src/plugins/):
- `remark-math` + `rehype-katex`: LaTeX math rendering
- `remark-directive`: Custom container/leaf directives
- `remark-container-directives`: Callout boxes (e.g., `:::info`, `:::warning`)
- `remark-leaf-directives`: Leaf directive parsing
- `remark-reading-time`: Calculate reading time
- `rehype-slug`: Generate heading anchors
- `rehype-heading-anchor`: Add permalink icons to headings
- `rehype-image-processor`: Image optimization with LQIP support
- `rehype-external-links`: Add target="_blank" rel="noopener" to external links
- `rehype-code-copy-button`: Copy button for code blocks

### Styling
- **UnoCSS**: Utility-first CSS with attributify mode
- **Presets**: `@unocss/preset-icons` for icons, `unocss-preset-theme` for theming
- **CSS modules**: [src/styles/](src/styles/) for component-specific styles
- **Color system**: Uses oklch color space for precise theming

### Comment System Architecture
Three providers supported via components in [src/components/Comment/](src/components/Comment/):
- **Giscus**: GitHub Discussions-based, requires repo setup
- **Twikoo**: Serverless comments via Vercel/Cloudflare
- **Waline**: Self-hosted with image upload support

Each provider has its own locale mapping in [src/i18n/config.ts](src/i18n/config.ts).

### Page Structure
- **Layouts**: `src/layouts/Layout.astro` (main), `Head.astro` (meta tags), `NewPost.astro` (post page)
- **Routes**: Catch-all routes like `[...index].astro`, `[...posts_slug].astro` handle i18n routing
- **Components**: `src/components/` includes UI elements, widgets (TOC, ImageZoom), and comment providers

### Performance Optimizations
- **PartyTown**: Offloads non-critical JS (analytics, comments) to web worker
- **Astro Compress**: Minifies CSS, HTML, and JavaScript
- **Viewport prefetching**: Preloads links when they enter viewport
- **LQIP**: Low Quality Image Placeholders generated during build
- **Image optimization**: Remote pattern support for image hosts

## Key Files

| File | Purpose |
|------|---------|
| [src/config.ts](src/config.ts) | Central theme configuration |
| [astro.config.ts](astro.config.ts) | Astro + integrations + markdown plugins |
| [src/i18n/config.ts](src/i18n/config.ts) | Locale mappings and language codes |
| [src/i18n/ui.ts](src/i18n/ui.ts) | UI text translations |
| [src/types/index.d.ts](src/types/index.d.ts) | ThemeConfig type definitions |
| [src/plugins/](src/plugins/) | Custom remark/rehype plugins |

## Important Notes

- **Package manager**: Uses pnpm 10.13.1
- **Pre-commit hooks**: Runs ESLint via lint-staged on `{js,ts,astro}` files
- **Vue integration**: Partially integrated for interactive components
- **Type checking**: Enabled via `astro check` before dev/build
- **Icons**: Uses Iconify with multiple icon sets configured
- **Content schema**: Frontmatter validation via Zod in `src/content/config.ts` (Astro Collections)
- **Page routing**: Uses Astro's file-based routing with `[...slug]` catch-all routes for i18n
- **Security**: Never commit `.env` and `.secret` files.

### When Creating Post

- **Post template**: Use `@template.md` at project root as the starting point for all new posts
- **Multilingual workflow**: When creating a new post:
  1. Create `xxx.md` (Chinese) by copying content from `template.md`
  2. Create `xxx.en.md` (English) with same template content, but change `lang: zh` to `lang: en`
  3. Both files should have identical frontmatter except for the `lang` property
- **Post images**: Store in `src/content/posts/_images/<post-name>/`
- **Draft posts**: Set `draft: true` by default in frontmatter to hide from production builds
