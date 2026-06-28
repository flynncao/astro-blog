# Security Rules

This file defines security guidelines for the Retypeset project.

## Secrets Management

- **Never commit `.env` files**
- **Never commit `.secret` files**
- Store sensitive configuration in environment variables
- Add `.env` and `.secret` to `.gitignore`

## Dependencies

- Use pnpm 10.13.1 as the package manager
- Review dependencies before adding new ones
- Keep dependencies updated via `pnpm update-theme`

## Content Security

- Validate all frontmatter with Zod schemas
- Sanitize user-generated content
- External links must use `target="_blank"` with `rel="noopener"`

## Build Security

- Type checking enabled via `astro check` before builds
- ESLint runs on pre-commit hooks
- Draft posts are excluded from production builds

## Third-Party Services

- Comment systems (Giscus, Twikoo, Waline) require proper configuration
- Analytics IDs should be environment-specific
- Open Graph images use isolated routes
