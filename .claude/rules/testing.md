# Testing Rules

This file defines testing and quality guidelines for the Retypeset project.

## Type Checking

- Run `pnpm astro check` for TypeScript validation
- Type checking runs automatically before `pnpm dev` and `pnpm build`
- Fix all type errors before committing

## Linting

- Run `pnpm lint` to check code quality
- Run `pnpm lint:fix` to auto-fix linting issues
- Pre-commit hooks run ESLint on `{js,ts,astro}` files

## Build Verification

- Run `pnpm build` to verify production build
- Run `pnpm preview` to test the production build locally
- Check that no build errors occur

## Content Validation

- All posts must have valid frontmatter per Zod schema
- Use `pnpm format-posts` to format content with autocorrect
- Images should have LQIP generated via `pnpm apply-lqip`

## Pre-Commit Checklist

1. TypeScript types pass (`astro check`)
2. ESLint passes (`pnpm lint`)
3. Build succeeds (`pnpm build`)
4. No secrets committed (check `.env`, `.secret` files)

## Commands Reference

```bash
# Development testing
pnpm dev          # Start dev server with type checking
pnpm build        # Build with type checking and LQIP generation
pnpm preview      # Preview production build

# Code quality
pnpm lint         # ESLint checking
pnpm lint:fix     # Auto-fix linting issues
pnpm astro check  # TypeScript checking only

# Content testing
pnpm format-posts # Format all posts
pnpm apply-lqip   # Generate LQIP for images
```
