# YourClub

> Events. Fests. Community.

## 2. Project Description

YourClub is a web platform for college clubs to publish fests and events, and for students to discover and register for them. Students browse fests and events, register in a few clicks, and get a digital ticket with a QR code. Club organizers (admins) manage fests, events, participants and users from a dedicated admin panel.

It was built for **DRMC** (clubs such as the IT Club, Robotics Society and Science Club) to replace paper forms and scattered spreadsheets with one place for registration, capacity control and attendance tracking.

## 3. Features

The features are grouped by the judging criteria first, followed by the **extra features**.

### 3.1 Fest Directory
- **Display available / upcoming fests:** the home page and the Fests page list fests with dates, organizing club and a status (upcoming, live or ended)
- **Event cards contain useful information:** category, fest name, date and time, venue, live seat availability and a registration status (open, waitlist or closed)
- **Search events:** search by title, description or venue
- **Event categories and filters:** filter by category and fest, and sort by start time or registration deadline
- **Open an event from the fest directory:** a fest page lists its events, and each event page shows the venue, schedule, fee, live seats and a registration deadline countdown

### 3.2 Registration System
- **Users can register for an event:** one-click registration, confirmed instantly when a seat is free, otherwise placed on a **waitlist**. When a seat opens up, the first person on the waitlist is confirmed automatically
- **Registration form works correctly:** pre-filled from the student's profile, with validation for name, student ID and mobile number
- **Registration confirmation:** a confirmation page with a digital ticket and **QR code**, downloadable as a file
- **Registration limits and deadlines work:** seat limits are enforced in the database, so a full event cannot be over-booked from the app, the API or the Supabase dashboard, and registration closes automatically at the deadline
- **Users can view and manage their registration:** the My Registrations page shows every registration with its status and lets the student cancel

### 3.3 Organizer Management
- **Organizer / admin dashboard:** totals, a 14-day registration trend chart, registrations by status and most popular events
- **View registered participants:** a participant list for every event
- **Search and filter participants:** search by name, email, phone, student ID or team, and filter by registration status and check-in state
- **Manage participant registration status:** change a status, or cancel a registration with an optional reason; the student is notified in the app, and the seat limit is respected
- **Statistics and useful management tools:** seat capacity bars, check-in tracking, **CSV** export of participants, and create, edit and delete **fests** and **events**

### 3.4 Extra Features
- Sign up / log in with **email and password or with a Google account**
- "Add to Google Calendar" link for every registered event
- In-app notifications (seat confirmed from the waitlist, cancelled or moved to the waitlist by an organizer) with unread badge and "mark all as read"
- Users page for admins: search all accounts, see their registrations, and delete an account
- Admins can add, edit and delete organizations
- Role-based access: admin pages and actions are protected both in the app and in the database (Row Level Security)

## 4. Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database and Auth | Supabase (PostgreSQL, Row Level Security, Supabase Auth with email/password and Google OAuth) |
| Supabase client | `@supabase/supabase-js`, `@supabase/ssr` |
| UI libraries | `lucide-react` (icons), `clsx`, `date-fns` |
| Extras | `qrcode.react` (QR tickets), `papaparse` (CSV export) |
| Hosting | Vercel |

## 5. Setup Instructions

**Requirements:** Node.js 20 or newer, npm, and a free [Supabase](https://supabase.com) account.

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd yourclub
   npm install
   ```

2. **Create a Supabase Project**, then open the **SQL Editor** and run the following files in this order:

   - `supabase/schema.sql` (tables, triggers, and views)
   - `supabase/policies.sql` (Row Level Security policies)
   - `supabase/seed.sql` (demo organizations, fests, and events)

3. **Create the environment file** `.env.local` in the project root (copy `.env.example` and fill in the values):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   - URL and keys are in Supabase: **Project Settings → API**.
   - `SUPABASE_SERVICE_ROLE_KEY` is used only on the server (to delete user accounts). Never expose it or commit it.

4. **Create the demo accounts** in Supabase: **Authentication → Users → Add user** (use the emails in section 7, tick "Auto Confirm User"). Then make the admin an admin (credentials in section 7):
   ```sql
   update public.profiles set role = 'admin' where email = 'admin@yourclub.dev';
   ```

5. **(Optional) Enable Google login.** Email/password login works without this step; the "Continue with Google" button only works after it is configured.
   1. In [Google Cloud Console](https://console.cloud.google.com), configure the **OAuth consent screen** (External, scopes `email`, `profile`, `openid`) and set it to **In production** so any Google account can sign in.
   2. Go to **Credentials → Create Credentials → OAuth client ID → Web application**.
      - Authorized JavaScript origins: `http://localhost:3000` (and your live URL after deployment)
      - Authorized redirect URI: the **Callback URL** shown on the Google provider page in Supabase (`https://<project-ref>.supabase.co/auth/v1/callback`)
   3. In Supabase: **Authentication → Sign In / Providers → Google**, enable it and paste the **Client ID** and **Client secret**.
   4. In Supabase: **Authentication → URL Configuration**, set **Site URL** to `http://localhost:3000` and add `http://localhost:3000/**` to **Redirect URLs** (add your live URL too after deployment).

   The Google Client ID and secret are stored in Supabase, not in `.env.local`, so no extra environment variable is needed.

6. **Run the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

**Production build:** `npm run build` then `npm start`.

## 6. Deployment URL

**https://yourclub-lyart.vercel.app**

## 7. Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@yourclub.dev` | `Admin@12345` |
| Student | `user@yourclub.dev` | `User@12345` |

## 8. Third-party Services / APIs

| Service | Used for |
|---|---|
| [Supabase](https://supabase.com) | PostgreSQL database, authentication, Row Level Security, server-side user management |
| Google OAuth (Google Cloud, "Sign in with Google") | Logging in and signing up with a Google account, handled through Supabase Auth |
| Google Calendar (URL template link) | "Add to Google Calendar" button; no API key or login needed |
| [Vercel](https://vercel.com) | Hosting and automatic deployment from GitHub |

No paid services are required to run the project.

## 9. AI Tools / Features Used

AI tools were used during development, as follows:

- **Claude (Anthropic)**: helped with planning features, writing and debugging code (for example the notifications page, admin event/fest management, users list and account deletion, Google sign-in) and this README.
- **ChatGPT**: helped with general queries and generated the home page background image.

All AI-generated code was reviewed, tested and integrated by the project author.

The application itself does not call any AI service at runtime.

## 10. Screenshots

### 10.1 Student (default user) screens

| Page | Screenshot |
|---|---|
| Home | ![Home](docs/screenshots/home.png) |
| Sign up | ![Sign up](docs/screenshots/signup.png) |
| Login (with Google button) | ![Login](docs/screenshots/login.png) |
| My profile | ![My profile](docs/screenshots/profile.png)<br>![My profile 2](docs/screenshots/profile2.png) |
| Fests and events | ![Fests and events](docs/screenshots/fests-events.png) |
| Event details | ![Event details](docs/screenshots/event-details.png) |
| Fest details | ![Fest details](docs/screenshots/fest-details.png) |
| Registration (form and QR ticket) | ![Registration form](docs/screenshots/registration.png)<br>![Ticket with QR code](docs/screenshots/ticket.png)<br>![Ticket download](docs/screenshots/ticket2.png) |
| My registrations | ![My registrations](docs/screenshots/my-registrations.png)<br>![My registrations 2](docs/screenshots/my-registrations2.png) |
| Notifications | ![Notifications](docs/screenshots/notifications.png)<br>![Notifications 2](docs/screenshots/notifications2.png) |

### 10.2 Admin screens

| Page | Screenshot |
|---|---|
| Admin dashboard | ![Dashboard](docs/screenshots/admin-dashboard.png)<br>![Dashboard 2](docs/screenshots/admin-dashboard2.png) |
| Add / edit organization | ![Organization form](docs/screenshots/admin-organization.png) |
| Add / edit fest | ![Fest form](docs/screenshots/admin-fest.png) |
| Manage users | ![Users](docs/screenshots/admin-users.png) |
| Manage events and participants | ![Admin events](docs/screenshots/admin-events.png)<br>![Participants](docs/screenshots/admin-participants.png) |
| Cancel registration | ![Cancel registration](docs/screenshots/cancel-registration.png)<br>![Cancel registration 2](docs/screenshots/cancel-registration2.png) |

## 11. Known Limitations

- No online payment: the event fee is shown for information only.
- Notifications are in-app only; no email or SMS is sent.
- Google is the only social login provider.
- Google login needs your own Google Cloud OAuth credentials; without them only email/password login works.
- Accounts created with Google may not have student ID, phone or department filled in.
- Deleting a user removes the account but does not block the same email from signing up again (no ban list).
- Admin roles can only be changed directly in the database; there is no role-management screen. Accounts created with Google or normal sign up are always students.
- Deleting a fest or event also deletes its linked registrations.
- Times are entered and shown in Bangladesh time (Asia/Dhaka).
- Designed mainly for desktop and mobile browsers; not tested on older browsers.

## 12. License

[License](LICENSE)

## 13. Project Structure

```
src/
├── app/
│   ├── (auth)/          login, signup
│   ├── (public)/        home, fests, events, registration, notifications
│   ├── admin/           dashboard, fests, events, participants, users
│   ├── auth/callback/   Google OAuth callback
│   └── api/             registration and export routes
├── components/          admin, auth, events, fests, home, layout, registration, ui
├── hooks/               custom React hooks
├── lib/                 Supabase clients, queries, helpers, constants
└── types/               shared TypeScript types
```
