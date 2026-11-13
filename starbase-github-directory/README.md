# Starbase — GitHub Star Directory

An editorial-style public directory powered by the starred repositories of **xASAHIx**. Includes search, multi-category filters, language filtering, sorting, grid/list views, responsive layout, and light/dark themes.

## Stack

- Next.js 15 App Router + React 19
- TypeScript
- GitHub REST API
- Vercel Cron (hourly cache revalidation)
- No database required for the public starred-repository feed

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The site fetches public stars from `https://api.github.com/users/xASAHIx/starred`. Set `GITHUB_USERNAME` to change the account. A GitHub token is optional for public repositories, but recommended to raise API rate limits.

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. Import it into Vercel.
3. Add these environment variables in Vercel:
   - `GITHUB_USERNAME=xASAHIx`
   - `GITHUB_TOKEN` (optional, recommended)
   - `CRON_SECRET` (generate a long random secret)
4. Deploy. Vercel Cron will call `/api/sync` once per hour using the configured cron authorization header.
5. Confirm the project is on a Vercel plan that supports Cron Jobs.

## Synchronization behavior

- `/api/repositories` fetches the complete public starred-repository list, paginating in batches of 100.
- The route is cached for one hour.
- The Vercel cron job revalidates the API route hourly, so additions and removals appear on the next directory request after the scheduled refresh.
- The “Refresh collection” control reloads the current API response. It does not bypass the server-side one-hour cache.

GitHub does not expose a simple personal-starred-list webhook. Hourly polling is used to detect both new stars and unstars. The API route reads the current list each time, so repositories that are no longer starred disappear from the directory after refresh.

## Categorization

Categories are inferred from repository topics, name, description, and language using the rules in `lib/categories.ts`. A repository can receive up to three categories. Repositories with no matching signals are shown under **Uncategorized**. Edit the rules in that file to customize the taxonomy.

## Notes

- Only public starred repositories are available without authentication.
- A public directory must not expose a GitHub personal access token. The token is read only by the server route.
- For accounts with a very large number of stars, configure `GITHUB_TOKEN` to avoid unauthenticated API rate limits.
- The category engine is deterministic and keyword-based; it does not call an AI model or transmit repository metadata to a third party.
