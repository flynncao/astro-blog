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

### Multi-language System
- **Supported locales**: `de`, `en`, `es`, `fr`, `ja`, `ko`, `pl`, `pt`, `ru`, `zh`, `zh-tw`
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
Three providers supported via components in [src/components/comments/](src/components/comments/):
- **Giscus**: GitHub Discussions-based, requires repo setup
- **Twikoo**: Serverless comments via Vercel/Cloudflare
- **Waline**: Self-hosted with image upload support

Each provider has its own locale mapping in [src/i18n/config.ts](src/i18n/config.ts).

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

## Development Notes

- **Package manager**: Uses pnpm 10.13.1
- **Pre-commit hooks**: Runs ESLint via lint-staged on `{js,ts,astro}` files
- **Vue integration**: Partially integrated for interactive components
- **Type checking**: Enabled via `astro check` before dev/build
- **Icons**: Uses Iconify with multiple icon sets configured
