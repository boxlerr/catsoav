# CATSO AV - Video Production Portfolio

This project is a premium, high-performance portfolio and management system for **CATSO AV**, a video production company specializing in videoclips, photography, and digital content.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Frontend:** React 19, Tailwind CSS 4, Framer Motion, dnd-kit
- **Backend:** Next.js Route Handlers, Prisma ORM
- **Authentication:** NextAuth.js (Credentials Provider)
- **Localization:** next-intl (ES/EN support)
- **Database:** PostgreSQL (Production), SQLite (Dev)
- **Integrations:** Behance API & Custom Scraping Engine

## 🛠️ Key Commands

- `npm run dev`: Start development server with Turbopack.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint.
- `npx prisma generate`: Generate Prisma client.
- `npx prisma migrate dev`: Run database migrations.
- `npx prisma db push`: Sync schema to database (use with caution).
- `npx prisma seed`: Seed the database with initial data.

## 📁 Project Structure

- `app/[locale]/`: Main application routes with i18n support.
  - `admin/`: Admin dashboard and management tools.
  - `project/[id]/`: Individual project detail pages.
- `components/`: Reusable UI components.
  - `admin/`: Specialized admin-only components.
- `lib/`: Core logic, including `auth.ts`, `prisma.ts`, and `behance-sync.ts`.
- `messages/`: Translation files (JSON) for `next-intl`.
- `prisma/`: Database schema and migration files.
- `public/`: Static assets (logos, placeholders, uploads).
- `types/`: Global TypeScript definitions.

## 📝 Development Conventions

- **Internationalization:** Always use `next-intl` for user-facing text. Add keys to `messages/` files.
- **Admin Features:** Admin functionality (reordering, project creation) is guarded by `NextAuth` roles.
- **Content Sync:** Use the Behance sync feature to pull projects from Behance. It supports YouTube, Vimeo, and Adobe CCV embeds.
- **Performance:** Use `dynamic()` imports for heavy components and maintain high SEO standards via the `metadata` object in layouts and pages.
- **Ordering:** Projects and categories use an `order` field (integer) for custom sorting, managed via drag-and-drop on the homepage for admins.

## 🔐 Environment Variables

Ensure the following are set in `.env`:
- `DATABASE_URL`: Connection string for PostgreSQL/SQLite.
- `NEXTAUTH_SECRET`: Secret for session encryption.
- `NEXTAUTH_URL`: Base URL of the application.
- `BEHANCE_API_KEY`: (Optional) API key for more reliable Behance syncing.
