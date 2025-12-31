# LinkBio

A Linktree-like service built with modern web technologies. Create and manage your personal link page with analytics, customizable designs, and social media integration.

## Tech Stack

- **Framework**: TanStack Start (SSR) with React 19
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Styling**: Tailwind 4 with shadcn/ui components
- **Linting**: Biome
- **Analytics**: Umami Analytics
- **Build Tool**: Vite

## Features

- Customizable link pages
- Social media profile links
- Profile customization (avatar, bio, thumbnail)
- Design customization (buttons, backgrounds, text)
- Analytics dashboard with visitor tracking
- Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- pnpm

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd linkbio
pnpm install
```

2. **Set up database**

Create a PostgreSQL database:
```sql
CREATE DATABASE linkbio;
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Random secret for authentication

4. **Run database migrations**
```bash
pnpm migrate
```

5. **Start development server**
```bash
pnpm dev
```

Visit `http://localhost:3000` to access the app.

### Production Build

```bash
pnpm build
```

### Umami Analytics (Optional)

LinkBio integrates with [Umami](https://umami.is) for visitor analytics.

```bash
VITE_UMAMI_WEBSITE_ID=your-website-id-here
VITE_UMAMI_API_URL=https://cloud.umami.is  # or your self-hosted instance
UMAMI_USERNAME=your-username-here
UMAMI_PASSWORD=your-password-here
```

You can create a free account at [Umami Cloud](https://cloud.umami.is) or self-host Umami.

### S3 File Storage (Optional)

LinkBio uses S3-compatible storage for avatars and thumbnails.

```bash
S3_ENABLED=false                    # Set to true to enable S3 storage
```

See [.env.example](.env.example) for all S3-related variables.

## Learn More

- [TanStack Docs](https://tanstack.com/llms.txt)
- [Better Auth Docs](https://www.better-auth.com/llms.txt)
- [Drizzle ORM Docs](https://orm.drizzle.team/llms.txt)
- [Shadcn/ui Docs](https://ui.shadcn.com/llms.txt)
