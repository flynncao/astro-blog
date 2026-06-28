# Code Style Rules

This file defines code style guidelines for the Retypeset project.

## General Principles

- Follow existing patterns in the codebase
- Use TypeScript for type safety
- Prefer explicit types over implicit inference for public APIs

## Astro Components

- Use `.astro` extension for Astro components
- Place components in `src/components/` with appropriate subdirectories
- Use kebab-case for multi-word component file names

## TypeScript

- Enable strict type checking via `astro check`
- Define types in `src/types/` directory
- Use Zod for content validation schemas

## CSS/Styling

- Use UnoCSS utility-first approach
- Prefer oklch color space for theming
- Component-specific styles go in `src/styles/` as CSS modules

## Linting

- Run `pnpm lint` before committing
- Run `pnpm lint:fix` to auto-fix issues
- ESLint runs via lint-staged on `{js,ts,astro}` files

## File Organization

```
src/
├── components/     # UI components (subdirectories for groups)
├── content/        # Astro Collections content
├── i18n/           # Internationalization files
├── layouts/        # Page layouts
├── pages/          # File-based routing
├── plugins/        # Remark/rehype plugins
├── styles/         # CSS modules
├── types/          # TypeScript definitions
└── utils/          # Utility functions
```

## Naming Conventions

- Components: PascalCase (e.g., `CommentSection.astro`)
- Utilities: camelCase (e.g., `getPostPath.ts`)
- Directories: kebab-case (e.g., `comment-section/`)
- Constants: UPPER_SNAKE_CASE for true constants
