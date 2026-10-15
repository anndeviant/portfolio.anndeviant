# Annas Portfolio

Single-page portfolio, built with Next.js, Supabase, Tailwind CSS, Framer Motion, and Lenis.

## Highlights

- Server-first data fetching in `src/app/page.tsx` with Supabase.
- Animated single-page layout powered by Framer Motion.
- Smooth scrolling and progress indicator via Lenis and a shared scroll wrapper.
- Responsive portfolio sections for hero, resume, stack, projects, and achievements.
- Remote media support for Supabase Storage, Iconify, Skill Icons, and curated external images.
- Fallback content when Supabase credentials are missing or data is unavailable.

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lenis
- Supabase JavaScript client
- tsParticles for the animated background

## Portfolio Sections

- `Hero`: profile identity, rotating titles, summary, portrait, and contact links
- `Resume Timeline`: education and work experience
- `Technical Stack`: Data/AI, Fullstack, Tools, and GenAI groups
- `Selected Work`: featured projects with technologies and links
- `Events & Achievements`: competitions, seminars, and learning milestones

## Data Sources

The app loads portfolio content from Supabase using these tables:

- `profiles`
- `projects`
- `work_experience`
- `education`
- `events`

Technical stack badges are stored locally in [src/data/tech_stacks.json](src/data/tech_stacks.json).

If Supabase is not configured, the app falls back to local demo content from `src/lib/fallback-data.ts`.

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional / Who Am I Secret Vault
VAULT_PASSCODE=your_secret_passcode
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret
```

The app safely returns fallback data when database variables are missing.
For `/whoami` storage management in Supabase `media/drive`, configure `VAULT_PASSCODE` and `SUPABASE_SERVICE_ROLE_KEY`.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Lint the codebase:

```bash
npm run lint
```

## Project Structure

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    Navbar.tsx
    ParticleBackground.tsx
    SmoothScroll.tsx
    sections/
      Hero.tsx
      Resume.tsx
      TechStack.tsx
      Projects.tsx
      Events.tsx
  data/
    tech_stacks.json
  lib/
    data-utils.ts
    fallback-data.ts
    supabase.ts
  types/
    database.ts
```

## Notes

- Local SQL exports and AI workflow instruction files are intentionally kept out of publish flow.
- Remote image domains are configured in `next.config.ts`.
- The current UI is optimized for a dark, editorial portfolio presentation.
