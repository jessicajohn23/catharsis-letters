# Catharsis 💌

*Letters you'll never send; written anonymously, some locked away until a future date you choose.*

Catharsis is a full-stack web app where people write letters to whoever they'll never actually send them to; a younger self, an ex, a parent, a best friend and post them completely anonymously or lock them until a future date, either to reopen privately or release into the world when the time comes.


## What it does

- **Anonymous letters** —> every letter is posted with zero attached identity. No usernames, no avatars, nothing tying it back to an author, anywhere in the public feed.
- **Letters to the future** —> write a letter, pick an unlock date, and it stays locked (visible to no one, including yourself) until that date arrives. When it unlocks, you get notified, and you choose upfront whether it stays private or gets posted anonymously at that point.
- **Anonymous hearts** —> react to letters without either side ever knowing who hearted what.
- **Customization** —> pick a background color from a wide palette and add a cute stamp to each letter.
- **Accounts, without breaking anonymity** —> email/password or Google sign-in, a unique username (checked live for availability), and a choice of 20 procedurally generated pixel avatars, used only for account management (login, "my letters," settings); never shown publicly next to a letter.
- **My Letters** —> a private dashboard of everything you've written, its status (posted / locked / unlocked), and its heart count, with the option to delete.
- **Dark / light mode.**


## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS (custom purple/pink theme, italic serif type) |
| Backend / DB | Supabase (Postgres, Auth, Row Level Security) |
| Scheduled jobs | `pg_cron`, running inside Postgres |
| Hosting | Vercel (static SPA) |

There's no custom backend server; Supabase's Postgres + Auth + RLS handles everything, including the part that matters most here: **anonymity is enforced at the database layer, not just hidden in the UI.**


## How anonymity is actually enforced

Every letter *does* store an `author_id` internally that's required to show someone their own letters and to know whose future-letter notification to fire. But the public feed is never read from the `letters` table directly. It goes through a single Postgres function, `get_public_feed()`, which is `SECURITY DEFINER` and explicitly selects a column list that excludes `author_id`. The frontend has no code path that could leak it, because it's never fetched to begin with. Hearts follow the same pattern; the row proving "this user hearted this letter" exists (to stop double-hearting) but Row Level Security only lets a user read their *own* heart rows, so there's no query anyone can run to see who hearted what.


## How the future-letter unlock works

A `pg_cron` job runs every minute inside Postgres, independent of whether anyone has the app open. It finds letters where `status = 'locked'` and `unlock_at <= now()`, flips them to `unlocked`, makes them public if the author chose that at write-time, and inserts a row into `notifications`; which the frontend polls to show the 🔔 bell.


## Project structure

src/

components/     --> PixelAvatar, LetterCard, StampAndColorPicker, Navbar, NotificationBell, ProtectedRoute

context/        --? AuthContext (Supabase session + profile), ThemeContext (dark/light)

pages/          --> SignUp, Login, UsernameSetup, AvatarSetup, Feed, Compose, MyLetters, Settings

lib/            --> supabaseClient.js, constants.js (stamps, colors, avatar seeds)

supabase/

schema.sql      --> tables, RLS policies, get_public_feed(), unlock_due_letters() + pg_cron schedule


## Running it locally

```bash
npm install
cp .env.example .env   --> fill in your Supabase project URL + anon key
npm run dev
```


## Environment variables

VITE_SUPABASE_URL= Your Project URL

VITE_SUPABASE_ANON_KEY= Your Anon Key


## Author

**Jessica John** 

[GitHub](https://github.com/jessicajohn23) · [LinkedIn](https://linkedin.com/in/jessicajohn07)
