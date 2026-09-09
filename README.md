# Blog System

A modern blog system built with Nuxt 3, Prisma, and SQLite.

## Features

- Markdown editor with live preview
- Admin dashboard for post management
- JWT authentication with httpOnly cookies
- Image upload support
- Responsive ghuntley.com-style design
- SEO-friendly URLs

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create the database:
```bash
npx prisma db push
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Seed the admin user:
```bash
npx tsx prisma/seed.ts
```

5. Start the development server:
```bash
npm run dev
```

## Admin Access

- Username: `admin`
- Password: `admin123`
- Admin panel: `/admin`

## Environment Variables

Create a `.env` file with:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

## Tech Stack

- Nuxt 3
- Prisma
- SQLite
- JWT (jsonwebtoken)
- bcrypt
- marked (Markdown parser)
