# Samir Edu World

Portfolio website for Samir Debnath — college teacher of Political Science and Education, and tuition teacher for college students. https://samireduworld.com

Static site, no build step. Animations: GSAP, ScrollTrigger, Lenis. Database, login and photo storage: Supabase.

## Files
- `index.html`, `about.html`, `subjects.html`, `notes.html`, `reviews.html`, `contact.html` — the six pages
- `styles.css`, `site.js` — shared design and behaviour for every page (loading screen, page transitions, menu, reviews, animations)
- `admin.html` — the admin panel (samireduworld.com/admin.html)
- `site-content.js` — list of everything the admin panel can edit
- `config.js` — Supabase keys (the only file a developer needs to edit)
- `supabase-setup.sql` — run once in Supabase to create the database
- `images/`, `og-image.jpg`, `favicon.svg`, `apple-touch-icon.png`, `robots.txt`, `sitemap.xml`

## One-time setup
1. Create a free project at supabase.com (Mumbai region).
2. SQL Editor → New query → paste all of `supabase-setup.sql` → Run.
3. Authentication → Users → Add user → Create new user: Samir's email and a password, tick "Auto Confirm User".
4. Authentication → Sign In / Providers: turn OFF "Allow new users to sign up".
5. Authentication → URL Configuration: Site URL `https://samireduworld.com`; add `https://samireduworld.com/admin.html` (and the vercel.app admin URL) to Redirect URLs.
6. Project Settings → API: copy the Project URL and anon public key into `config.js`.
7. Push to GitHub. Vercel redeploys.

## Daily use (Samir)
Open samireduworld.com/admin.html, log in, edit, press Save changes. The website updates instantly.
Reviews: switch one off to hide it, or delete it. Photos: upload from the phone; "Pencil-drawing style" turns it into a sketch automatically.

Only emails listed in the `admins` table can save changes. To add another admin, run:
`insert into public.admins (email) values ('someone@example.com');`

Website by Sourab Das.
